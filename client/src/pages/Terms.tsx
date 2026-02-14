import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, Shield } from 'lucide-react';

const Terms = () => {
    return (
        <div className="min-h-screen bg-slate-50 p-4 md:p-8">
            <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm p-6 md:p-12">
                <Link to="/login" className="inline-flex items-center text-slate-500 hover:text-slate-900 mb-8 transition-colors">
                    <ChevronLeft className="w-5 h-5 mr-1" />
                    Back to Login
                </Link>

                <div className="flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
                        <Shield className="w-5 h-5 text-slate-900" />
                    </div>
                    <h1 className="text-3xl font-bold text-slate-900">Terms of Service</h1>
                </div>

                <div className="prose prose-slate max-w-none text-slate-600">
                    <p className="text-sm text-slate-400 mb-8">Last updated: {new Date().toLocaleDateString()}</p>

                    <section className="mb-8">
                        <h2 className="text-xl font-bold text-slate-900 mb-4">1. Acceptance of Terms</h2>
                        <p className="mb-4">
                            By accessing and using Aura Match ("the App"), you agree to be bound by these Terms of Service.
                            If you do not agree to these terms, please do not use the App.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-bold text-slate-900 mb-4">2. Eligibility</h2>
                        <p className="mb-4">
                            You must be at least 18 years of age to create an account on Aura Match. By creating an account and
                            using the Service, you represent and warrant that:
                        </p>
                        <ul className="list-disc pl-5 space-y-2 mb-4">
                            <li>You can form a binding contract with Aura Match.</li>
                            <li>You are not a person who is barred from using the Service under the laws of the United States or any other applicable jurisdiction.</li>
                            <li>You will comply with this Agreement and all applicable local, state, national, and international laws, rules, and regulations.</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-bold text-slate-900 mb-4">3. Your Account</h2>
                        <p className="mb-4">
                            You are responsible for maintaining the confidentiality of your login credentials you use to sign up for
                            Aura Match, and you are solely responsible for all activities that occur under those credentials.
                            If you think someone has gained access to your account, please immediately contact us.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-bold text-slate-900 mb-4">4. Community Rules</h2>
                        <p className="mb-4">
                            By using the Service, you agree that you will not:
                        </p>
                        <ul className="list-disc pl-5 space-y-2 mb-4">
                            <li>Use the Service for any purpose that is illegal or prohibited by this Agreement.</li>
                            <li>Use the Service in order to damage Aura Match.</li>
                            <li>Spam, solicit money from or defraud any members.</li>
                            <li>Impersonate any person or entity or post any images of another person without his or her permission.</li>
                            <li>Bully, "stalk", intimidate, assault, harass, mistreat or defame any person.</li>
                            <li>Post any content that violates or infringes anyone's rights, including rights of publicity, privacy, copyright, trademark or other intellectual property or contract right.</li>
                            <li>Post any content that is hate speech, threatening, sexually explicit or pornographic.</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-bold text-slate-900 mb-4">5. Content</h2>
                        <p className="mb-4">
                            You are solely responsible for the content and information that you post, upload, publish, link to, transmit, record,
                            display or otherwise make available (hereinafter, "post") on the Service or transmit to other members
                            (hereinafter, "Content").
                        </p>
                        <p className="mb-4">
                            You verify that all information submitted upon creation of your account, including information submitted from
                            your Facebook or Google account, is accurate and truthful.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-bold text-slate-900 mb-4">6. Safety; Your Interactions with Other Members</h2>
                        <p className="mb-4">
                            Though Aura Match strives to encourage a respectful member experience, it is not responsible for the conduct
                            of any member on or off of the Service. You agree to use caution in all interactions with other members,
                            particularly if you decide to communicate off the Service or meet in person.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-bold text-slate-900 mb-4">7. Disclaimer of Warranties</h2>
                        <p className="mb-4">
                            Aura Match provides the service on an "as is" and "as available" basis and to the extent permitted by
                            applicable law, grants no warranties of any kind, whether express, implied, statutory or otherwise with
                            respect to the service (including all content contained therein), including, without limitation, any implied
                            warranties of satisfactory quality, merchantability, fitness for a particular purpose or non-infringement.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default Terms;
