
import Image from "next/image";

export default function Home() {
  return (
    <main className="flex flex-col w-full h-
    full min-h-screen items-center bg-white">

        {/*navigation bar*/}
        <nav className="flex items-center w-screen justify-between bg-white my-7 px-[112px] py-2">
          <div className=" text-black font-medium text-[30px]">Travel App</div>
          <div className="flex gap-5 items-center justify-center">
            <div><a href="/pages/login" className="flex text-black text-lg font-mono hover:bg-black hover:text-white rounded-xl px-5 py-1 ">Log in</a></div>
            <div className="flex-auto rounded-xl bg-black px-5 py-2 hover:scale-125 transition hover:duration-200">
            <div><a href="/pages/signup" className="text-sm text-white" >Sign Up</a></div>
            </div>
          </div>
        </nav>

        {/* Main banner */}
        <div className="flex relative bg-black rounded-[30px] mt-2 w-[85%] h-[500px] overflow-hidden">

          <img className="object-fill h-[100%] w-[100%]" src="./nature2.jpg" alt='nature'></img>
          <div className="flex-col absolute ml-[100px] mt-[80px] ">
            <div>
              <p className="text-white text-[18px] font-mono">Ai Integrated Travel Recommendations</p>
              <p className="text-white text-[100px] font-seriff">Adventure</p>
              <p className="text-white text-[18px] font-mono">Let AI be your compass as you conquer</p>
              <p className="text-white text-[18px] font-mono">challenges, explore new horizons abd earn</p>
              <p className="text-white text-[18px] font-mono">exciting rewards!</p>
              <a href="http://localhost:4000"><img className="h-[40px] w-[40px] mt-[20px] hover:scale-125 transition hover:duration-200 " src="./right_white.png" alt="arrow"></img></a>
            </div>
          </div>

        </div>

        {/* Recommended places section */}
        <div className="flex-col mt-8">

          <div className="flex w-screen justify-between px-[125px]">
            <h1 className="text-[30px] font-bold font-sans text-black">Recommended places</h1>
            <div className="flex"> //arrows
              <img className="h-[60px] w-[60px]" src="./arrow_left_black.png" alt="arrow_left"></img>
              <img className="h-[60px] w-[60px]" src="./arrow_right_black.png" alt="arrow_right"></img>
            </div>
          </div>

          <div className="flex w-screen px-[125px] gap-7 mt-4"> {/*Recommended places tiles */}

              <div className="flex rounded-[15px] h-[220px] w-[400px] bg-gray-600 overflow-hidden">
                  <img className="w-full object-cover" src="./taj.jpg" alt="taj_mahal"></img>
                  <h1 className="absolute text-white font-sans font-bold text-2xl ml-4 mt-4 ">Agra</h1>
              </div>
              <div className="flex rounded-[15px] h-[220px] w-[400px] bg-gray-600 overflow-hidden">
                  <img className="w-full object-cover" src="./gateway.jpg" alt="gateway"></img>
                  <h1 className="absolute text-white font-sans font-bold text-2xl ml-4 mt-4 ">Mumbai</h1>
              </div>
              <div className="flex rounded-[15px] h-[220px] w-[400px] bg-gray-600 overflow-hidden">
                  <img className="w-full object-cover" src="./jammu.jpg" alt="jammu"></img>
                  <h1 className="absolute text-white font-sans font-bold text-2xl ml-4 mt-4 ">Jammu & Kashmir</h1>
              </div>

          </div>

        </div>

        {/* Promotion of app section */}
        <div className="flex relative rounded-[20px] w-[80%] h-[450px] overflow-hidden mt-12">
            <img className="object cover w-full" src="./abstract_image.jpg" alt="abstract_image"></img>

            <div className="flex absolute">
                <div className="flex-col mx-[120px] my-20">
                    <p className="text-sm font-sans text-purple-500">powered by AI</p>
                    <p className="text-[42px] font-sans font-bold text-purple-950">Let others know</p>
                    <p className="text-[42px] font-sans font-bold text-purple-950">your Adventures</p>
                    <p className="text-[22px] font-mono font-bold text-purple-700">easily document and share your</p>
                    <p className="text-[22px] font-mono font-bold text-purple-700">travel experiences with friends and family</p>
                    <p className="text-[22px] font-mono font-bold text-purple-700">through photos, videos, and personalized stories.</p>
                    <div><a href="#" className="flex justify-center rounded-3xl w-[150px] bg-purple-900 text-white font-sans mt-2 p-2 hover:scale-125 transition hover:duration-200">Download now</a></div>
                </div>
                {/* <img className="" src="" alt=""></img> */}
            </div>
            
        </div>
        
    </main>
  );
}