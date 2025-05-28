import React, { useState, useEffect } from 'react'
import Link from "next/link";

import { getCategories } from '../services'

const Header = () => {
    const [categories, setCategories] = useState([]);
    
    // Define which categories should appear in the header nav
    const headerCategories = ['ward', 'activities']; // Use the slugs from Hygraph if you want other categories on the header
    
    useEffect(() => {
        getCategories().then((newCategories) => {
            // Filter categories to only show the ones we want in header
            const filteredCategories = newCategories.filter(category => 
                headerCategories.includes(category.slug)
            );
            setCategories(filteredCategories);
        });
    }, [])

    return (
        <div className="container mx-auto px-10 mb-8">
            <div className="border-b w-full inline-block border-blue-400 py-8">
                <div className="md:float-left block">
                    <Link href="/">
                        <span className="cursor-pointer font-bold text-4xl text-white">
                            Rivergrove 1st Ward
                        </span>
                    </Link>
                </div>
                <div className="hidden md:float-left md:contents">
                    {categories.map((category) =>(
                        <Link key={category.slug} href={`/category/${category.slug}`}>
                            <span className="md:float-right mt-2 align-middle text-white ml-4 font-semibold cursor-pointer">
                                {category.name}
                            </span>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
  )
}

export default Header