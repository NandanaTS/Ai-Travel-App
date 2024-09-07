import pandas as pd
import numpy as np
import random
import os
import json
import tensorflow as tf
import matplotlib.pyplot as plt
from sklearn import preprocessing
from IPython.display import display

class Util(object):
    def read_data(self, places_file, user_data_file):
        print("Reading the data")
        places = pd.read_json(places_file)
        with open(user_data_file, 'r') as f:
            user_data = json.load(f)
        return places, user_data

    def create_ratings(self, places, user_data):
        ratings_list = []
        for user, data in user_data.items():
            for place in data.get('likedLocations', []):
                ratings_list.append({'user_id': user, 'place': place, 'rating': 5})
            for place in data.get('visitedLocations', []):
                ratings_list.append({'user_id': user, 'place': place, 'rating': 4})
            for place in data.get('addedLocations', []):
                ratings_list.append({'user_id': user, 'place': place, 'rating': 3})
        
        ratings = pd.DataFrame(ratings_list)
        ratings = ratings.merge(places.rename(columns={'Place': 'place'}), on='place', how='left')
        return ratings

    def preprocess(self, ratings):
        print("Preprocessing the dataset")
        unique_places = ratings.place.unique()
        unique_places.sort()
        place_index = [i for i in range(len(unique_places))]
        rbm_place_df = pd.DataFrame(list(zip(place_index, unique_places)), columns=['rbm_place_id', 'place'])

        joined = ratings.merge(rbm_place_df, on='place')
        joined = joined[['user_id', 'place', 'rbm_place_id', 'rating']]
        user_group = joined.groupby('user_id')

        total = []
        for user_id, cur_user in user_group:
            temp = np.zeros(len(unique_places))
            for num, place in cur_user.iterrows():
                temp[place['rbm_place_id']] = place['rating'] / 5.0
            total.append(temp)

        return joined, total
    
    def split_data(self, total_data):
        print("Free energy required, dividing into train and validation sets")
        random.shuffle(total_data)
        n = len(total_data)
        print("Total size of the data is: {0}".format(n))
        size_train = max(1, int(n * 0.75))  # Ensure at least one item in training set
        X_train = total_data[:size_train]
        X_valid = total_data[size_train:]
        print("Size of the training data is: {0}".format(len(X_train)))
        print("Size of the validation data is: {0}".format(len(X_valid)))
        return X_train, X_valid

    def free_energy(self, v_sample, W, vb, hb):
        v_sample = np.atleast_2d(v_sample)  # Ensure v_sample is at least 2D
        wx_b = np.dot(v_sample, W) + hb
        vbias_term = np.dot(v_sample, vb)
        hidden_term = np.sum(np.log(1 + np.exp(wx_b)), axis=1)
        return -hidden_term - vbias_term

class RBM(object):
    def __init__(self, alpha, H, num_vis):
        self.alpha = alpha
        self.num_hid = H
        self.num_vis = num_vis
        self.errors = []
        self.energy_train = []
        self.energy_valid = []

    def training(self, train, valid, user, epochs, batchsize, free_energy, verbose, filename):
        tf.compat.v1.disable_eager_execution()
        
        vb = tf.compat.v1.placeholder(tf.float32, [self.num_vis])
        hb = tf.compat.v1.placeholder(tf.float32, [self.num_hid])
        W = tf.compat.v1.placeholder(tf.float32, [self.num_vis, self.num_hid])
        v0 = tf.compat.v1.placeholder(tf.float32, [None, self.num_vis])

        print("Phase 1: Input Processing")
        _h0 = tf.nn.sigmoid(tf.matmul(v0, W) + hb)
        h0 = tf.nn.relu(tf.sign(_h0 - tf.random.uniform(tf.shape(_h0))))
        print("Phase 2: Reconstruction")
        _v1 = tf.nn.sigmoid(tf.matmul(h0, tf.transpose(W)) + vb)
        v1 = tf.nn.relu(tf.sign(_v1 - tf.random.uniform(tf.shape(_v1))))
        h1 = tf.nn.sigmoid(tf.matmul(v1, W) + hb)

        print("Creating the gradients")
        w_pos_grad = tf.matmul(tf.transpose(v0), h0)
        w_neg_grad = tf.matmul(tf.transpose(v1), h1)

        CD = (w_pos_grad - w_neg_grad) / tf.cast(tf.shape(v0)[0], tf.float32)

        update_w = W + self.alpha * CD
        update_vb = vb + self.alpha * tf.reduce_mean(v0 - v1, 0)
        update_hb = hb + self.alpha * tf.reduce_mean(h0 - h1, 0)

        err = v0 - v1
        err_sum = tf.reduce_mean(err * err)

        cur_w = np.zeros([self.num_vis, self.num_hid], np.float32)
        cur_vb = np.zeros([self.num_vis], np.float32)
        cur_hb = np.zeros([self.num_hid], np.float32)
        prv_w = np.random.normal(loc=0, scale=0.01, size=[self.num_vis, self.num_hid])
        prv_vb = np.zeros([self.num_vis], np.float32)
        prv_hb = np.zeros([self.num_hid], np.float32)

        print("Running the session")
        sess = tf.compat.v1.Session()
        sess.run(tf.compat.v1.global_variables_initializer())

        print("Training RBM with {0} epochs and batch size: {1}".format(epochs, batchsize))
        print("Starting the training process")
        util = Util()
        for i in range(epochs):
            for start, end in zip(range(0, len(train), batchsize), range(batchsize, len(train), batchsize)):
                batch = train[start:end]
                cur_w = sess.run(update_w, feed_dict={v0: batch, W: prv_w, vb: prv_vb, hb: prv_hb})
                cur_vb = sess.run(update_vb, feed_dict={v0: batch, W: prv_w, vb: prv_vb, hb: prv_hb})
                cur_hb = sess.run(update_hb, feed_dict={v0: batch, W: prv_w, vb: prv_vb, hb: prv_hb})
                prv_w = cur_w
                prv_vb = cur_vb
                prv_hb = cur_hb

            if valid:
                etrain = np.mean(util.free_energy(train, cur_w, cur_vb, cur_hb))
                self.energy_train.append(etrain)
                evalid = np.mean(util.free_energy(valid, cur_w, cur_vb, cur_hb))
                self.energy_valid.append(evalid)
            self.errors.append(sess.run(err_sum, feed_dict={v0: train, W: cur_w, vb: cur_vb, hb: cur_hb}))
            if verbose:
                print("Error after {0} epochs is: {1}".format(i+1, self.errors[i]))
            elif i % 10 == 9:
                print("Error after {0} epochs is: {1}".format(i+1, self.errors[i]))
        if not os.path.exists('rbm_models'):
            os.mkdir('rbm_models')
        filename = 'rbm_models/' + filename
        if not os.path.exists(filename):
            os.mkdir(filename)
        np.save(filename + '/w.npy', prv_w)
        np.save(filename + '/vb.npy', prv_vb)
        np.save(filename + '/hb.npy', prv_hb)
        
        if free_energy:
            print("Exporting free energy plot")
            self.export_free_energy_plot(filename)
        print("Exporting errors vs epochs plot")
        self.export_errors_plot(filename)
        inputUser = [train[user]]
        hh0 = tf.nn.sigmoid(tf.matmul(v0, W) + hb)
        vv1 = tf.nn.sigmoid(tf.matmul(hh0, tf.transpose(W)) + vb)
        feed = sess.run(hh0, feed_dict={v0: inputUser, W: prv_w, hb: prv_hb})
        rec = sess.run(vv1, feed_dict={hh0: feed, W: prv_w, vb: prv_vb})
        return rec

    def export_free_energy_plot(self, filename):
        print("Exporting free energy plot")
        plt.plot(self.energy_train)
        plt.plot(self.energy_valid)
        plt.xlabel('Epochs')
        plt.ylabel('Average free energy')
        plt.legend(['Train', 'Valid'])
        plt.title('Free energy evolution')
        plt.savefig(filename + '/free_energy.png')
        plt.clf()

    def export_errors_plot(self, filename):
        print("Exporting errors vs epochs plot")
        plt.plot(self.errors)
        plt.xlabel('Epochs')
        plt.ylabel('Error')
        plt.title('Error vs epochs evolution')
        plt.savefig(filename + '/errors.png')
        plt.clf()

def recommend_places(rec, util, places, ratings):
    print("Columns in ratings DataFrame:", ratings.columns)
    print("First few rows of ratings DataFrame:\n", ratings.head())

    # Ensure rbm_user_id and rbm_place_id columns exist
    unique_users = ratings['user_id'].unique()
    unique_places = ratings['place'].unique()

    user_to_rbm_id_mapping = {user: idx for idx, user in enumerate(unique_users)}
    place_to_rbm_id_mapping = {place: idx for idx, place in enumerate(unique_places)}

    if 'rbm_user_id' not in ratings.columns:
        print("Creating 'rbm_user_id' column")
        ratings['rbm_user_id'] = ratings['user_id'].apply(lambda x: user_to_rbm_id_mapping.get(x, -1))

    if 'rbm_place_id' not in ratings.columns:
        print("Creating 'rbm_place_id' column")
        ratings['rbm_place_id'] = ratings['place'].apply(lambda x: place_to_rbm_id_mapping.get(x, -1))

    print("Columns in ratings DataFrame after ensuring rbm_user_id and rbm_place_id:", ratings.columns)
    print("First few rows of ratings DataFrame:\n", ratings.head())

    place_mapper = ratings[['place', 'rbm_place_id']].drop_duplicates().set_index('rbm_place_id').to_dict()['place']
    user_mapper = ratings[['user_id', 'rbm_user_id']].drop_duplicates().set_index('rbm_user_id').to_dict()['user_id']

    print("Structure of rec object:", type(rec))
    print("rec.shape:", rec.shape)

    recommendations = []
    for user_idx in range(rec.shape[0]):
        try:
            user_recommendations = rec[user_idx]
            print(f"User {user_idx}, Recommendations: {user_recommendations}")

            # Convert the recommendations to integers
            rec_user_list = list(map(int, user_recommendations))
            print(f"Converted recommendations to integers: {rec_user_list}")

            recommended_places = [place_mapper[i] for i in rec_user_list if i in place_mapper]
            recommendations.append({
                'user': user_mapper[user_idx],
                'recommendations': recommended_places
            })
        except IndexError as e:
            print(f"IndexError for user {user_idx}: {e}")
        except Exception as e:
            print(f"Error for user {user_idx}: {e}")
    return recommendations

def main():

 # File paths
    places_file = 'C:/Users/melvi/Desktop/Travel App/Travel-App/backend/Datasets/places_to_visit_kerala.json'
    user_data_file = 'C:/Users/melvi/Desktop/Travel App/Travel-App/backend/userData/userData.json'
    output_folder = 'rbm_results'

    util = Util()
    alpha = 0.6
    hidden_units = 50
    epochs = 100
    batchsize = 50
    verbose = True

    places, user_data = util.read_data(places_file, user_data_file)
    ratings = util.create_ratings(places, user_data)
    joined, total_data = util.preprocess(ratings)

    X_train, X_valid = util.split_data(total_data)

    rbm = RBM(alpha, hidden_units, len(joined['rbm_place_id'].unique()))

    user_index = 0
    
    print("Finished training RBM")
    rec = rbm.training(X_train, X_valid, user_index, epochs, batchsize, free_energy=True, verbose=verbose, filename=output_folder)
    recommendations = recommend_places(rec, util, places, ratings)
    print(recommendations)

if __name__ == '__main__':
    main()

