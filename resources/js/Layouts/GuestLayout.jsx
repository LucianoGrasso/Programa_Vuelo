import { Link } from '@inertiajs/react';

export default function Guest({ children }) {
    return (
        <div className="min-h-screen flex flex-col sm:justify-center items-center pt-6 sm:pt-0 bg-gray-900 text-gray-100">
            <div>
                <Link href="/">
                    {/* Reemplazamos el vector por la imagen real del PC-7 */}
                    <img 
                        src="/images/LogoPC7.png" 
                        alt="Logo PC-7" 
                        className="w-28 h-auto object-contain drop-shadow-[0_4px_10px_rgba(59,130,246,0.3)]"
                    />
                </Link>
            </div>

            <div className="w-full sm:max-w-md mt-6 px-6 py-4 bg-gray-800 border border-gray-700 shadow-md overflow-hidden sm:rounded-lg">
                {children}
            </div>
        </div>
    );
}