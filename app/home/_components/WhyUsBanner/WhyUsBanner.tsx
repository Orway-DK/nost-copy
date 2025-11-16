// @/app/_components/WhyUsBanner/WhyUsBanner.tsx
import Image from "next/image";

import { BiWorld } from "react-icons/bi";

export default function WhyUs() {
    return (
        <>
            <div className="flex flex-row w-full max-w-7xl h-[60vh] my-20">
                <div className="w-4xl relative">
                    <Image src={"/h1-banner01.jpg"} alt="bannerImage1" width={500} height={500} className="rounded-3xl absolute" />
                    <Image src={"/h1-banner02.jpg"} alt="bannerImage2" width={400} height={400} className="rounded-3xl absolute bottom-0 right-0" />
                    <div className="absolute bottom-15 flex flex-col ml-10">
                        <span className="text-5xl text-blue-700">24+</span>
                        <span className="text-lg">Years Of Experience</span>
                    </div>
                </div>
                <div className="w-4xl">
                    <div className="flex flex-col  ml-5">
                        <span className="rounded-full bg-blue-100 w-fit py-1 px-2 text-blue-700 font-semibold uppercase ml-2">BEST PRINTING COMPANY</span>
                        <span className="text-5xl mt-2">Reason To <span className="text-blue-700">Get Printing</span> Started With Us</span>
                    </div>
                    <div className="flex flex-col text-xl font-normal mt-8 ml-20">
                        <span>We are 100+ professional printing with more than 10 years of experience in create product design. Believe it because you’ve seen it. Here are real numbers.</span>
                        <ul className="gap-2 mt-2">
                            <li className="flex flex-row px-4 py-2 gap-4">
                                <BiWorld className="text-6xl text-blue-700" />
                                <div className="flex flex-col">
                                    <span className="font-bold text-xl">High Profit Margin</span>
                                    <span className="font-normal text-md">Effective optimization of cost and quality that makes you highly profitable.</span>
                                </div>
                            </li>
                            <li className="flex flex-row px-4 py-2 gap-4">
                                <BiWorld className="text-6xl text-blue-700" />
                                <div className="flex flex-col">
                                    <span className="font-bold text-xl">
Global Shipping</span>
                                    <span className="font-normal text-md">Reaching global market easily with our fast and flexible shipping solution.</span>
                                </div>
                            </li>
                            <li className="flex flex-row px-4 py-2 gap-4">
                                <BiWorld className="text-6xl text-blue-700" />
                                <div className="flex flex-col">
                                    <span className="font-bold text-xl">Trending Products</span>
                                    <span className="font-normal text-md">Maximize your sale volume with our high market demanding products.</span>
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>

            </div>
        </>
    );
}
