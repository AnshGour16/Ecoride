import React from 'react';

const Footer = () => {
    return (
        <footer className="bg-dark text-white text-center py-3">
            <div className="container">
                <p>&copy; {new Date().getFullYear()} EcoRide. All rights reserved.</p>
                <ul className="list-inline">
                    <li className="list-inline-item">
                        <a href="/privacy" className="text-white">Privacy Policy</a>
                    </li>
                    <li className="list-inline-item">
                        <a href="/terms" className="text-white">Terms of Service</a>
                    </li>
                    <li className="list-inline-item">
                        <a href="/contact" className="text-white">Contact Us</a>
                    </li>
                </ul>
            </div>
        </footer>
    );
};

export default Footer;