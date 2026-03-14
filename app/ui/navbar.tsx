
import Link from "next/link";
import NavLinks from "./nav-links";

export default function Navbar(){
    return(
        <div className="max-w-6xl mx-auto flex items-center justify-between p-4">
            <NavLinks />
        </div>
    )
}