"use client";
import { useState } from "react";
import Head from "next/head";

export default function Home() {
  const [activeSection, setActiveSection] = useState("featured");
  const [searchQuery, setSearchQuery] = useState("");

  const categories = [
    { id: "featured", name: "Featured", icon: "⭐" },
    { id: "top", name: "Top Charts", icon: "🏆" },
    { id: "language", name: "Language", icon: "💬" },
    { id: "image", name: "Image", icon: "🖼️" },
    { id: "audio", name: "Audio", icon: "🎵" },
    { id: "video", name: "Video", icon: "🎬" },
    { id: "code", name: "Code", icon: "💻" },
  ];

  const models = [
    {
      id: "gpt-4",
      name: "GPT-4",
      provider: "OpenAI",
      icon: "https://th.bing.com/th?q=Chatgpt+Logo+White+PNG&w=120&h=120&c=1&rs=1&qlt=70&o=7&cb=1&pid=InlineBlock&rm=3&mkt=en-IN&cc=IN&setlang=en&adlt=moderate&t=1&mw=247",
      description: "Most capable AI model for complex tasks",
      rating: 4.9,
      credits: 5,
      category: "language",
      featured: true,
      topRated: true,
    },
    {
      id: "midjourney-v6",
      name: "MidJourney v6",
      provider: "MidJourney",
      icon: "https://th.bing.com/th?q=Mid-Journey+Logo+No+Background&w=120&h=120&c=1&rs=1&qlt=70&o=7&cb=1&pid=InlineBlock&rm=3&mkt=en-IN&cc=IN&setlang=en&adlt=moderate&t=1&mw=247",
      description: "Latest version with enhanced realism",
      rating: 4.9,
      credits: 10,
      category: "image",
      featured: true,
      topRated: true,
    },
    {
      id: "dall-e",
      name: "DALL-E 3",
      provider: "OpenAI",
      icon: "https://th.bing.com/th?q=Chatgpt+Logo+White+PNG&w=120&h=120&c=1&rs=1&qlt=70&o=7&cb=1&pid=InlineBlock&rm=3&mkt=en-IN&cc=IN&setlang=en&adlt=moderate&t=1&mw=247",
      description: "Create images from text descriptions",
      rating: 4.8,
      credits: 8,
      category: "image",
      featured: true,
    },
    {
      id: "eleven-multilingual",
      name: "Eleven Multilingual",
      provider: "ElevenLabs",
      icon: "https://th.bing.com/th/id/ODLS.eb4d2bdc-b09b-4c2a-a542-b83c7d5afa00?w=32&h=32&o=6&cb=12&pid=AdsPlus",
      description: "Multilingual text-to-speech synthesis",
      rating: 4.7,
      credits: 6,
      category: "audio",
      topRated: true,
    },
    {
      id: "whisper",
      name: "Whisper",
      provider: "OpenAI",
      icon: "https://th.bing.com/th?q=Chatgpt+Logo+White+PNG&w=120&h=120&c=1&rs=1&qlt=70&o=7&cb=1&pid=InlineBlock&rm=3&mkt=en-IN&cc=IN&setlang=en&adlt=moderate&t=1&mw=247",
      description: "Speech-to-text transcription",
      rating: 4.6,
      credits: 3,
      category: "audio",
    },
    {
      id: "deepseek-coder",
      name: "DeepSeek Coder",
      provider: "DeepSeek",
      icon: "https://th.bing.com/th/id/ODF.YxK1MUJaRoBfBG4UGNrXAA?w=32&h=32&qlt=90&pcl=fffffc&o=6&cb=12&pid=1.2",
      description: "Specialized in programming and code generation",
      rating: 4.5,
      credits: 3,
      category: "code",
      topRated: true,
    },
    {
      id: "gen-2",
      name: "Gen-2",
      provider: "Runway",
      icon: "https://th.bing.com/th/id/ODF.lU0e8Zv_Hc2RxwgY3bXKDw?w=32&h=32&qlt=90&pcl=fffffa&o=6&cb=12&pid=1.2",
      description: "Text to video generation",
      rating: 4.4,
      credits: 12,
      category: "video",
    },
    {
      id: "mistral-large",
      name: "Mistral Large",
      provider: "Mistral AI",
      icon: "https://th.bing.com/th/id/ODF.d2MUKyqVdf-YIWDLkq6srg?w=32&h=32&qlt=90&pcl=fffffa&o=6&cb=12&pid=1.2",
      description: "Top-tier reasoning capabilities",
      rating: 4.6,
      credits: 4,
      category: "language",
    },
  ];

  const filteredModels = models.filter((model) => {
    if (activeSection === "featured") return model.featured;
    if (activeSection === "top") return model.topRated;
    if (activeSection === "all") return true;
    return model.category === activeSection;
  });

  const handleModelClick = (modelId) => {
    console.log(`Navigating to model: ${modelId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>AI Playstore - Unified AI Models Hub</title>
      </Head>

      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center mr-3">
                <span className="text-white font-bold text-sm">AI</span>
              </div>
              <h1 className="text-xl font-bold text-gray-900">AI Playstore</h1>
            </div>

            {/* Search Bar */}
            <div className="flex-1 max-w-2xl mx-8">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search AI models..."
                  className="w-full bg-gray-100 border-0 rounded-lg py-2 px-4 pl-10 focus:ring-2 focus:ring-purple-500 focus:bg-white"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <div className="absolute left-3 top-2.5">
                  <span className="text-gray-400">🔍</span>
                </div>
              </div>
            </div>

            {/* User Actions */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center bg-gray-100 rounded-lg px-3 py-1">
                <span className="text-sm text-gray-600 mr-2">Credits:</span>
                <span className="font-semibold">1,250</span>
              </div>
              <button className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800">
                Add Credits
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Play Store Style Sections */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Discover AI Models
          </h2>

          {/* Horizontal Category Scroll */}
          <div className="flex space-x-4 overflow-x-auto pb-4">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveSection(category.id)}
                className={`flex flex-col items-center p-4 rounded-2xl min-w-[100px] transition-all ${
                  activeSection === category.id
                    ? "bg-purple-100 text-purple-700 border-2 border-purple-200"
                    : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
                }`}
              >
                <span className="text-2xl mb-2">{category.icon}</span>
                <span className="text-sm font-medium whitespace-nowrap">
                  {category.name}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Section Title */}
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-900">
            {categories.find((c) => c.id === activeSection)?.name} Models
          </h3>
          <div className="text-sm text-gray-500">
            {filteredModels.length} models
          </div>
        </div>

        {/* Models Grid - Play Store Style */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredModels.map((model) => (
            <div
              key={model.id}
              onClick={() => handleModelClick(model.id)}
              className="bg-white rounded-xl p-4 hover:shadow-lg transition-all duration-200 cursor-pointer border border-gray-200"
            >
              {/* Model Icon */}
              <div className="flex justify-center mb-3">
                <img
                  src={model.icon}
                  alt={model.name}
                  className="w-16 h-16 rounded-2xl"
                />
              </div>

              {/* Model Name */}
              <h4 className="font-semibold text-gray-900 text-sm text-center mb-1 line-clamp-1">
                {model.name}
              </h4>

              {/* Provider Name */}
              <p className="text-gray-500 text-xs text-center mb-2">
                {model.provider}
              </p>

              {/* Rating and Credits */}
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-1">
                  <span className="text-green-600 text-xs font-bold">
                    {model.rating}
                  </span>
                  <span className="text-yellow-400 text-xs">★</span>
                </div>
                <div className="text-xs font-semibold text-purple-600">
                  {model.credits} cr
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Featured Section - Like Play Store Banners */}
        {activeSection === "featured" && (
          <div className="mt-12">
            <h3 className="text-xl font-bold text-gray-900 mb-6">
              Editor's Choice
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {models
                .filter((m) => m.featured)
                .slice(0, 2)
                .map((model) => (
                  <div
                    key={model.id}
                    className="bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl p-6 text-white"
                  >
                    <div className="flex items-center space-x-4">
                      <img
                        src={model.icon}
                        alt={model.name}
                        className="w-16 h-16 rounded-2xl"
                      />
                      <div>
                        <h4 className="font-bold text-lg">{model.name}</h4>
                        <p className="text-purple-100 text-sm">
                          {model.description}
                        </p>
                        <div className="flex items-center space-x-4 mt-2">
                          <div className="flex items-center space-x-1">
                            <span className="font-bold">{model.rating}</span>
                            <span className="text-yellow-300">★</span>
                          </div>
                          <span className="bg-white/20 px-3 py-1 rounded-full text-xs">
                            {model.credits} credits
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Quick Stats */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
            <div className="text-2xl font-bold text-gray-900">
              {models.length}
            </div>
            <div className="text-gray-500 text-sm">AI Models</div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
            <div className="text-2xl font-bold text-gray-900">
              {new Set(models.map((m) => m.provider)).size}
            </div>
            <div className="text-gray-500 text-sm">Providers</div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
            <div className="text-2xl font-bold text-gray-900">1</div>
            <div className="text-gray-500 text-sm">Unified Account</div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
            <div className="text-2xl font-bold text-gray-900">1</div>
            <div className="text-gray-500 text-sm">Credit System</div>
          </div>
        </div>
      </main>
    </div>
  );
}
