"use client"
import { FaRegEnvelope} from 'react-icons/fa';
import {Md13Mp, MdLockOutline, MdOutlineLock} from 'react-icons/md';
import { useState } from 'react';
import { auth } from '../../../firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { useRouter } from 'next/navigation';

export default function signup() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleSignup = async () => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      router.push('/'); // Redirect to home page after successful signup
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <div
    style={{
      backgroundImage: `url('https://marketplace.canva.com/EAFt0-MWpSU/2/0/900w/canva-soft-watercolour-no-copy-phone-wallpaper-in-purple-and-blue-gradient-style-O5sd-yFWWG4.jpg')`,
      backgroundSize: '100% 100%', // Ensures the image covers the entire viewport
      backgroundRepeat: 'no-repeat', // Prevents the image from repeating
      backgroundPosition: 'center', // Centers the image in the viewport
      width: '100vw',
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
  }}
  
    >
      <div className="flex flex-col items-center justify-center h-full py-2">
        <main className="flex flex-col items-center justify-center w-full h-1/2 flex-1 px-30 text-center">
          <div className="bg-white  rounded-2xl shadow-2xl flex w-3/4 max-w-5xl">
            <div className="w-3/5 p-5">
              <div className="text-left font-bold">
                <span className="text-purple-500">Travel-App</span>
              </div>
              <div className="py-14">
                <h2 className="text-3xl font-bold text-purple-500 mb-16">SIGN UP</h2>
                <div className="flex flex-col items-center">
                  <div className="bg-gray-100 w-64 p-2 flex items-center mb-3">

                  <Md13Mp className="text-gray-400 m-2"/>
                    <input
                       type="text" 
                       name="username" 
                       placeholder="Username" 
                       value={username}
                       className="bg-gray-100 text-black outline-none text-sm flex-1 px-2"
                       onChange={(e) => setUsername(e.target.value)}
                    />
                  </div>
                  <div className="bg-gray-100 w-64 p-2 flex items-center mb-3">

                  <FaRegEnvelope className="text-gray-400 m-2"/>
                    <input 
                      type="email"
                      name="email"
                      placeholder="Email" 
                      value={email}
                      className="bg-gray-100 text-black outline-none text-sm flex-1 px-2"
                      onChange={(e) => setEmail(e.target.value)}
                      />
                  </div>
                  <div className="bg-gray-100 w-64 p-2 flex items-center mb-3">
                  <MdLockOutline className="text-gray-400 m-2"/>

                    <input 
                      type="password" 
                      name="password" 
                      placeholder="Password" 
                      value={password}
                      className="bg-gray-100 text-black outline-none text-sm flex-1 px-2"
                      onChange={(e)=>setPassword(e.target.value)}
                      />
                  </div>

                  <div className="flex justify-between w-64 mb-5">
                    <label className="flex items-center text-xs text-purple-500">
                      <input 
                        type="checkbox" 
                        name="remember" 
                        className="mr-1" />
                      Remember me
                    </label>
                    <a href="#" className="text-xs text-purple-500">Forgot Password</a>
                  </div>
                  {/*signup*/}
                  <button 
                    type = "submit"
                    className="border-2 border-purple-500 text-purple-500 rounded-full px-12 py-2 inline-block font-semibold hover:bg-purple-500 hover:text-white"
                    onClick={() => handleSignup()}
                    >Sign Up
                  </button>
                </div>
              </div>
            </div>
            <div className="w-2/5 bg-purple-500 text-white rounded-tr-2xl rounded-br-2xl py-36 px-12">
              <h2 className="text-3xl font-bold mb-2">Hello!</h2>
              <div className="border-2 w-10 border-purple-500 inline-block mb-2"></div>
              <p className="mb-10">Explore the world effortlessly with our travel app. Do you already have an account? Then Login here!</p>
              <a href="/pages/login" className="border-2 border-white rounded-full px-12 py-2 inline-block font-semibold hover:bg-white hover:text-purple-500">Login</a>
            </div>
          </div>
        </main>
      </div>
    </div>


  )
}