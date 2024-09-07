"use client"
import { useState } from 'react';
import { auth } from '../../../firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useRouter } from 'next/navigation';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async () => {
    setEmailError(null);
    setPasswordError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/'); // Redirect to home page after successful login
    } catch (e: any) {
      if (e.code === 'auth/invalid-email' || e.code === 'auth/user-not-found') {
        setEmailError('Invalid email or user does not exist');
      } else if (e.code === 'auth/wrong-password') {
        setPasswordError('Incorrect password');
      } else {
        setEmailError('An error occurred. Please try again.');
        setPasswordError('An error occurred. Please try again.');
      }
    }
  };

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
      <div style={{
        backgroundColor: 'rgba(255, 255, 255, 0.3)', // Adjusted transparency for better readability
        padding: '2rem',
        borderRadius: '0.5rem',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        width: '100%',
        maxWidth: '24rem',
      }}>
        <h2 className="text-2xl text-black font-bold mb-8 text-center">Login</h2>
        <div>
          <div className="mb-4">
            <div className="block text-gray-700 font-semibold mb-2">Email</div>
            <input
              type="email" 
              id="email" 
              name="email" 
              value={email}
              className={`w-full text-black px-3 py-2 border ${emailError ? 'border-red-500' : 'border-gray-300'} rounded focus:outline-none focus:border-black`} 
              placeholder="Enter your email"
              onChange={(e) => setEmail(e.target.value)}
            />
            {emailError && <p className="text-red-600 text-sm mt-1">{emailError}</p>}
          </div>
          <div className="mb-4">
            <div className="block text-gray-700 font-semibold mb-2">Password</div>
            <input 
              type="password" 
              id="password" 
              name="password" 
              value={password}
              className={`w-full text-black px-3 py-2 border ${passwordError ? 'border-red-500' : 'border-gray-300'} rounded focus:outline-none focus:border-black`} 
              placeholder="Enter your password"
              onChange={(e) => setPassword(e.target.value)}
            />
            {passwordError && <p className="text-red-600 text-sm mt-1">{passwordError}</p>}
          </div>
          <div className="mb-4 flex items-center justify-between">
            <label className="flex items-center text-black">
              <input type="checkbox" id="rememberMe" name="rememberMe" className="mr-2" />
              Remember Me
            </label>
            <a href="#" className="text-sm text-black hover:underline">Forgot Password?</a>
          </div>
          <div className="mb-6">
            <button 
              type="submit" 
              className="w-full bg-black text-white py-2 px-4 rounded hover:bg-gray-300 focus:outline-none focus:bg-gray-300"
              onClick={handleLogin}
            >
              Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
