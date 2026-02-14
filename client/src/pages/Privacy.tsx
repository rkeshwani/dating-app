import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, Lock } from 'lucide-react';

const Privacy = () => {
    return (
        <div className="min-h-screen bg-slate-50 p-4 md:p-8">
            <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm p-6 md:p-12">
                <Link to="/login" className="inline-flex items-center text-slate-500 hover:text-slate-900 mb-8 transition-colors">
                    <ChevronLeft className="w-5 h-5 mr-1" />
                    Back to Login
                </Link>

                <div className="flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
                        <Lock className="w-5 h-5 text-slate-900" />
                    </div>
                    <h1 className="text-3xl font-bold text-slate-900">Privacy Policy</h1>
                </div>

                <div className="prose prose-slate max-w-none text-slate-600">
                    <p className="text-sm text-slate-400 mb-8">Last updated: {new Date().toLocaleDateString()}</p>

                    <section className="mb-8">
                        <h2 className="text-xl font-bold text-slate-900 mb-4">1. Introduction</h2>
                        <p className="mb-4">
                            Welcome to the Aura Match Privacy Policy. We appreciate that you trust us with your information and we intend to always keep that trust.
                            This starts with making sure you understand the information we collect, why we collect it, how it is used and your choices regarding your information.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-bold text-slate-900 mb-4">2. Information We Collect</h2>
                        <p className="mb-4">
                            We collect information you provide to us directly, such as when you create an account, update your profile, or interact with other users.
                        </p>
                        <ul className="list-disc pl-5 space-y-2 mb-4">
                            <li><strong>Account Information:</strong> Name, email address, date of birth, gender, and photos.</li>
                            <li><strong>Profile Information:</strong> Bios, interests, and other details you choose to share.</li>
                            <li><strong>Usage Information:</strong> Information about your activity on our services, for instance how you use them (e.g., date and time you logged in, features you've been using, searches, clicks and pages which have been shown to you, referring webpage address, advertising that you click on) and how you interact with other users (e.g., users you connect and interact with, time and date of your exchanges, number of messages you send and receive).</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-bold text-slate-900 mb-4">3. How We Use Information</h2>
                        <p className="mb-4">
                            The main reason we use your information is to deliver and improve our services. Additionally, we use your info to help keep you safe and to provide you with advertising that may be of interest to you.
                        </p>
                        <ul className="list-disc pl-5 space-y-2 mb-4">
                            <li>To create and manage your account.</li>
                            <li>To provide you with customer support and respond to your requests.</li>
                            <li>To communicate with you about our services.</li>
                            <li>To analyze profile data and recommend compatible matches.</li>
                            <li>To prevent, detect and fight fraud or other illegal or unauthorized activities.</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-bold text-slate-900 mb-4">4. How We Share Information</h2>
                        <p className="mb-4">
                            Since our goal is to help you make meaningful connections, the main sharing of users' information is, of course, with other users.
                        </p>
                        <p className="mb-4">
                            We may also share some users' information with service providers and partners who assist us in operating the services, in some cases, for legal reasons.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-bold text-slate-900 mb-4">5. Your Rights</h2>
                        <p className="mb-4">
                            We want you to be in control of your information, so we have provided you with the following tools:
                        </p>
                        <ul className="list-disc pl-5 space-y-2 mb-4">
                            <li><strong>Access / Update tools in the service:</strong> Tools and account settings that help you to access, rectify or delete information that you provided to us and that's associated with your account directly within the service.</li>
                            <li><strong>Device permissions:</strong> Mobile platforms have permission systems for specific types of device data and notifications, such as phone book and location services as well as push notifications. You can change your settings on your device to either consent or oppose the collection of the corresponding information or the display of the corresponding notifications.</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-bold text-slate-900 mb-4">6. Security</h2>
                        <p className="mb-4">
                            We work hard to protect you from unauthorized access to or alteration, disclosure or destruction of your personal information.
                            However, as with all technology companies, although we take steps to secure your information, we do not promise, and you should not expect,
                            that your personal information will always remain secure.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default Privacy;
