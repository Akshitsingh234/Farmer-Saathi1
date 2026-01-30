"use client";
import type { NextPage } from "next";
import Head from "next/head";

// Helper component for SVG icons to keep the main code clean.
const Icon = ({ name }: { name: string }) => {
  const icons: { [key: string]: JSX.Element } = {
    scheme: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z"
        />
      </svg>
    ),
    challenge: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-6.75c-.622 0-1.125.504-1.125 1.125V18.75m9 0h-9"
        />
      </svg>
    ),
    community: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m-7.5-2.962c.513-.96 1.487-1.591 2.571-1.82m-2.571 1.82a9.094 9.094 0 01-3.741-.479 3 3 0 014.682-2.72m-4.682 2.72-3.234 3.234a1.5 1.5 0 002.121 2.121l3.234-3.234m0 0a3 3 0 10-4.243-4.243 3 3 0 004.243 4.243z"
        />
      </svg>
    ),
    social: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9A2.25 2.25 0 004.5 18.75z"
        />
      </svg>
    ),
    journal: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
        />
      </svg>
    ),
    insights: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"
        />
      </svg>
    ),
    communityPost: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z"
        />
      </svg>
    ),
    todolist: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
      >
        {" "}
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
        {" "}
      </svg>
    ),
    facebook: (
      <svg
        className="w-6 h-6"
        fill="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
          clipRule="evenodd"
        ></path>
      </svg>
    ),
    inventory: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 7.5l9-4.5 9 4.5M4.5 7.5h15v9.75A2.25 2.25 0 0117.25 19.5H6.75A2.25 2.25 0 014.5 17.25V7.5z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M8.25 10.5h7.5M8.25 14.25h7.5"
        />
      </svg>
    ),

    instagram: (
      <svg
        className="w-6 h-6"
        fill="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.024.06 1.378.06 3.808s-.012 2.784-.06 3.808c-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.024.048-1.378.06-3.808.06s-2.784-.012-3.808-.06c-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.048-1.024-.06-1.378-.06-3.808s.012-2.784.06-3.808c.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 016.345 2.525c.636-.247 1.363-.416 2.427-.465C9.793 2.013 10.147 2 12.315 2zm-1.162 1.905c-1.468.007-2.827.01-3.238.01s-.47.003-1.048.022c-.89.034-1.424.195-1.828.345-.48.18-.844.444-1.212.812-.368.368-.632.732-.812 1.212-.15.404-.31.938-.345 1.828-.02.578-.022.69-.022 1.048s.002.47.022 1.048c.034.89.195 1.424.345 1.828.18.48.444.844.812 1.212.368.368.732.632 1.212.812.404.15.938.31 1.828.345.578.02.69.022 1.048.022s.47-.002 1.048-.022c.89-.034 1.424-.195 1.828-.345.48-.18.844.444 1.212.812.368.368.632-.732.812-1.212.15-.404.31-.938.345-1.828.02-.578.022-.69.022-1.048s-.002-.47-.022-1.048c-.034-.89-.195-1.424-.345-1.828-.18-.48-.444-.844-.812-1.212-.368-.368-.732-.632-1.212-.812-.404-.15-.938-.31-1.828-.345-.578-.02-.69-.022-1.048-.022s-.47.002-1.048.022zm2.328 1.977a4.402 4.402 0 100 8.804 4.402 4.402 0 000-8.804zm-3.008 4.402a3.008 3.008 0 116.016 0 3.008 3.008 0 01-6.016 0zm6.536-4.87a1.2 1.2 0 100 2.4 1.2 1.2 0 000-2.4z"
          clipRule="evenodd"
        ></path>
      </svg>
    ),
    twitter: (
      <svg
        className="w-6 h-6"
        fill="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
      </svg>
    ),
  };
  return icons[name] || null;
};

// Re-styled Feature Card component for a cleaner and more modern look.
const FeatureCard = ({ iconName, title, description, link, linkText }: any) => (
  <div className="bg-white/50 backdrop-blur-lg p-8 rounded-2xl border border-stone-200/80 shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 group">
    <div className="w-16 h-16 mb-6 flex items-center justify-center rounded-2xl bg-gradient-to-br from-amber-100 to-rose-200 text-amber-700 transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg">
      <div className="w-8 h-8">
        <Icon name={iconName} />
      </div>
    </div>
    <h3 className="text-xl font-bold text-stone-800 mb-2">{title}</h3>
    <p className="text-stone-600 mb-6">{description}</p>
    <a
      href={link}
      className="font-bold text-amber-600 hover:text-rose-600 transition-colors duration-300 flex items-center group"
    >
      {linkText}
      <span className="ml-2 transition-transform duration-300 group-hover:translate-x-1">
        &rarr;
      </span>
    </a>
  </div>
);

const HomePage: NextPage = () => {

  return (
    // NEW: Using a soft, warm background color for an earthy, artisanal feel.
    <div className="bg-[#FBF9F6] text-stone-800 font-sans">
      <Head>
        <title>Farmer Saathi - Empowering Modern Agriculture</title>
        <meta name="description" content="Smart farming solutions, crop insights, and community support for progressive farmers." />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        {/* ## Hero Section (More vibrant and engaging) */}
        <section
          className="relative w-full h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage:
              "url('/src/image/Gemini_Generated_Image_rzhdyjrzhdyjrzhd.png')",
          }}
        >
          {/* NEW: Replaced the harsh black overlay with a subtle, multi-colored gradient for a more artistic feel. */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent"></div>
          <div className="relative z-10 text-center text-white p-6 max-w-4xl mx-auto">
            {/* NEW: Enhanced typography with a gradient on the accent text for a unique, eye-catching effect. */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold leading-tight mb-4 drop-shadow-lg tracking-tight">
              Empowering Modern Farmers, One Harvest at a Time.
            </h1>
            <p className="text-lg md:text-xl text-stone-200 max-w-2xl mx-auto mb-10 drop-shadow-md">
              Smart farming solutions, crop insights, and community support for progressive farmers.
            </p>
            {/* NEW: Updated the button with a gradient and more engaging hover animation. */}
            <a
              href="#features"
              className="inline-flex items-center justify-center bg-gradient-to-r from-amber-500 to-rose-600 text-white font-bold py-4 px-10 rounded-full text-lg 
                         hover:shadow-xl hover:scale-105 transition-all duration-300 shadow-lg group"
            >
              Explore Smart Tools
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2.5}
                stroke="currentColor"
                className="w-5 h-5 ml-2 group-hover:translate-x-1.5 transition-transform duration-300"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4.5 12h15m0 0l-6.75-6.75M19.5 12l-6.75 6.75"
                />
              </svg>
            </a>
          </div>
        </section>

        {/* ## Features Section (Cleaner layout with unique glassmorphism cards) */}
        <section
          id="features"
          className="py-24 md:py-32 bg-gradient-to-b from-[#FBF9F6] to-amber-50"
        >
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-stone-900 tracking-tight">
                Your Smart Farming Toolkit
              </h2>
              <p className="text-stone-600 mt-3 text-lg max-w-2xl mx-auto">
                Everything you need to thrive, from crop management to market insights and government schemes.
              </p>
            </div>
            {/* NEW: Replaced the repeated divs with a reusable FeatureCard component for cleaner code. */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <FeatureCard
                iconName="insights"
                title="Crop Market Insights"
                description="Get AI-powered insights on crop prices, market trends, and optimal selling strategies."
                link="/farmer-assist/crop-pricing"
                linkText="View Market Data"
              />

              <FeatureCard
                iconName="insights"
                title="Agricultural Events"
                description="Find local and national agricultural fairs, training programs, and farmer meets."
                link="/farmer-assist/events"
                linkText="Open Tool"
              />
              <FeatureCard
                iconName="scheme"
                title="Agricultural Schemes"
                description="Discover and apply for government schemes, subsidies, and support programs for farmers."
                link="/schemes"
                linkText="Explore Schemes"
              />
              <FeatureCard
                iconName="social"
                title="Crop Planning Assistant"
                description="Plan your crops based on season, soil type, and market demand with AI recommendations."
                link="/crop-planning"
                linkText="Plan Crops"
              />

              <FeatureCard
                iconName="challenge"
                title="Farming Challenges"
                description="Participate in sustainable farming challenges and learn from fellow farmers."
                link="/farmconnect/challenges"
                linkText="Join Challenges"
              />
              <FeatureCard
                iconName="communityPost"
                title="Crop Advisory"
                description="Get expert advice on crop selection, pest management, and farming techniques."
                link="/crop-advisory"
                linkText="Get Advice"
              />
              <FeatureCard
                iconName="journal"
                title="Farmer Connect"
                description="Share your farming journey and connect with fellow farmers in your community."
                link="/farmconnect/stories"
                linkText="Connect Now"
              />
              <FeatureCard
                iconName="todolist"
                title="Farm Task Manager"
                description="Organize your daily farm activities, track progress, and never miss important tasks."
                link="/todo"
                linkText="Manage Tasks"
              />
              <FeatureCard
                iconName="inventory"
                title="Farm Inventory"
                description="Track seeds, fertilizers, equipment, and harvest quantities efficiently."
                link="/inventory"
                linkText="Manage Inventory"
              />

            </div>
          </div>
        </section>

        {/* ## About Section (More focused and visually separated) */}
        <section className="py-24 bg-rose-50">
          <div className="container mx-auto px-6 text-center max-w-3xl">
            <h2 className="text-3xl md:text-4xl font-bold text-stone-900 mb-4 tracking-tight">
              Our Mission
            </h2>
            <p className="text-xl text-stone-700 leading-relaxed">
              Farmer Saathi is dedicated to empowering farmers with modern technology and data-driven insights. We believe in sustainable agriculture by providing smart tools, market intelligence, and a supportive farming community to help every farmer maximize their yield and income.
            </p>
          </div>
        </section>
      </main>

      {/* ## Footer (Darker, more distinct footer for a clean finish) */}
      <footer className="bg-stone-800 text-stone-400">
        <div className="container mx-auto px-6 py-10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="text-center md:text-left">
              <p>
                © 2024 Farmer Saathi. All rights reserved.
              </p>
            </div>
            <div className="flex space-x-6">
              <a href="#" className="hover:text-amber-400 transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="hover:text-amber-400 transition-colors">
                Terms of Service
              </a>
              <a href="#" className="hover:text-amber-400 transition-colors">
                Contact
              </a>
            </div>
            <div className="flex space-x-6">
              <a
                href="#"
                aria-label="Facebook"
                className="hover:text-white transition-colors"
              >
                <Icon name="facebook" />
              </a>
              <a
                href="#"
                aria-label="Instagram"
                className="hover:text-white transition-colors"
              >
                <Icon name="instagram" />
              </a>
              <a
                href="#"
                aria-label="Twitter"
                className="hover:text-white transition-colors"
              >
                <Icon name="twitter" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
