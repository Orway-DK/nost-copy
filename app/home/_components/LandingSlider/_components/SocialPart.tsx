//Social Part

// CircularText.tsx
import { FaFacebookF } from "react-icons/fa";
import { FaInstagram } from "react-icons/fa";
import { RiInstagramFill } from "react-icons/ri";

import { BsYoutube } from "react-icons/bs";

export default function SocialPart() {
    return (
        <ul className="absolute  lg:right-50 xl:right-50 flex flex-col gap-4 z-50">
            <li className="w-12 h-12 rounded-full flex items-center justify-center 
            border-2 border-blue-400 text-blue-500
            hover:text-white hover:fill-white hover:bg-blue-400
            cursor-pointer
            "><FaFacebookF size={20} /></li>
            <li className="w-12 h-12 rounded-full flex items-center justify-center 
            border-2 border-blue-400 text-blue-500
            hover:text-white hover:fill-white hover:bg-blue-400
            cursor-pointer"><RiInstagramFill size={20} /></li>
            <li className="w-12 h-12 rounded-full flex items-center justify-center 
            border-2 border-blue-400 text-blue-500
            hover:text-white hover:fill-white hover:bg-blue-400
            cursor-pointer"><BsYoutube size={20} /></li>
        </ul>
    );
}
