"use client";
// pages/index.js
import { useState } from "react";
import Head from "next/head";

export default function Home() {
  const [selectedProvider, setSelectedProvider] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Data structure: Providers with their models (apps)
  const providers = [
    {
      id: "openai",
      name: "OpenAI",
      icon: "https://th.bing.com/th?q=Chatgpt+Logo+White+PNG&w=120&h=120&c=1&rs=1&qlt=70&o=7&cb=1&pid=InlineBlock&rm=3&mkt=en-IN&cc=IN&setlang=en&adlt=moderate&t=1&mw=247",
      category: "Language & Image",
      models: [
        {
          id: "gpt-4",
          name: "GPT-4",
          icon: "🧠",
          description: "Most capable AI model for complex tasks",
          rating: 4.9,
          credits: 5,
          category: "Language",
        },
        {
          id: "gpt-3.5",
          name: "GPT-3.5 Turbo",
          icon: "⚡",
          description: "Fast and efficient for everyday tasks",
          rating: 4.7,
          credits: 2,
          category: "Language",
        },
        {
          id: "dall-e",
          name: "DALL-E 3",
          icon: "🎨",
          description: "Create images from text descriptions",
          rating: 4.8,
          credits: 8,
          category: "Image",
        },
        {
          id: "whisper",
          name: "Whisper",
          icon: "🎤",
          description: "Speech-to-text transcription",
          rating: 4.6,
          credits: 3,
          category: "Audio",
        },
      ],
    },
    {
      id: "midjourney",
      name: "MidJourney",
      icon: "https://th.bing.com/th?q=Mid-Journey+Logo+No+Background&w=120&h=120&c=1&rs=1&qlt=70&o=7&cb=1&pid=InlineBlock&rm=3&mkt=en-IN&cc=IN&setlang=en&adlt=moderate&t=1&mw=247",
      category: "Image",
      models: [
        {
          id: "midjourney-v6",
          name: "MidJourney v6",
          icon: "🖼️",
          description: "Latest version with enhanced realism",
          rating: 4.9,
          credits: 10,
          category: "Image",
        },
        {
          id: "niji-journey",
          name: "Niji Journey",
          icon: "🎎",
          description: "Anime and illustrative style generation",
          rating: 4.8,
          credits: 8,
          category: "Image",
        },
      ],
    },
    {
      id: "elevenlabs",
      name: "ElevenLabs",
      icon: "https://th.bing.com/th/id/ODLS.eb4d2bdc-b09b-4c2a-a542-b83c7d5afa00?w=32&h=32&o=6&cb=12&pid=AdsPlus",
      category: "Audio",
      models: [
        {
          id: "eleven-multilingual",
          name: "Eleven Multilingual v2",
          icon: "🌐",
          description: "Multilingual text-to-speech synthesis",
          rating: 4.7,
          credits: 6,
          category: "Audio",
        },
        {
          id: "voice-cloning",
          name: "Voice Cloning",
          icon: "👤",
          description: "Clone and replicate any voice",
          rating: 4.6,
          credits: 15,
          category: "Audio",
        },
      ],
    },
    {
      id: "deepseek",
      name: "DeepSeek",
      icon: "https://th.bing.com/th/id/ODF.YxK1MUJaRoBfBG4UGNrXAA?w=32&h=32&qlt=90&pcl=fffffc&o=6&cb=12&pid=1.2",
      category: "Language & Code",
      models: [
        {
          id: "deepseek-coder",
          name: "DeepSeek Coder",
          icon: "💻",
          description: "Specialized in programming and code generation",
          rating: 4.5,
          credits: 3,
          category: "Programming",
        },
        {
          id: "deepseek-v2",
          name: "DeepSeek V2",
          icon: "🌐",
          description: "General purpose language model",
          rating: 4.4,
          credits: 2,
          category: "Language",
        },
      ],
    },
    {
      id: "mistral",
      name: "Mistral AI",
      icon: "https://th.bing.com/th/id/ODF.d2MUKyqVdf-YIWDLkq6srg?w=32&h=32&qlt=90&pcl=fffffa&o=6&cb=12&pid=1.2",
      category: "Language",
      models: [
        {
          id: "mistral-large",
          name: "Mistral Large",
          icon: "💎",
          description: "Top-tier reasoning capabilities",
          rating: 4.6,
          credits: 4,
          category: "Language",
        },
        {
          id: "mixtral",
          name: "Mixtral 8x7B",
          icon: "🎭",
          description: "Mixture of experts model",
          rating: 4.5,
          credits: 3,
          category: "Language",
        },
      ],
    },
    {
      id: "runway",
      name: "Runway",
      icon: "https://th.bing.com/th/id/ODF.lU0e8Zv_Hc2RxwgY3bXKDw?w=32&h=32&qlt=90&pcl=fffffa&o=6&cb=12&pid=1.2",
      category: "Video",
      models: [
        {
          id: "gen-2",
          name: "Gen-2",
          icon: "🎥",
          description: "Text to video generation",
          rating: 4.4,
          credits: 12,
          category: "Video",
        },
        {
          id: "image-to-video",
          name: "Image to Video",
          icon: "🔄",
          description: "Transform images into videos",
          rating: 4.3,
          credits: 8,
          category: "Video",
        },
      ],
    },
  ];

  // Get all models for display
  const allModels = providers.flatMap((provider) =>
    provider.models.map((model) => ({
      ...model,
      provider: provider.name,
      providerIcon: provider.icon,
    }))
  );

  // Filter models based on selection
  const filteredModels = allModels.filter((model) => {
    const matchesProvider =
      selectedProvider === "all" ||
      providers.find((p) => p.name === model.provider)?.id === selectedProvider;
    const matchesSearch =
      model.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      model.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesProvider && matchesSearch;
  });

  // Handle model click - for navigation to detail page
  const handleModelClick = (modelId) => {
    // This would navigate to the model detail page
    console.log(`Navigating to model: ${modelId}`);
    // In a real app: router.push(`/models/${modelId}`)
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>AI Playstore - Unified AI Models Hub</title>
        <meta name="description" content="Access all AI models in one place" />
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
        {/* Provider Filter Tabs */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Providers
          </h2>
          <div className="flex space-x-2 overflow-x-auto pb-2">
            <button
              onClick={() => setSelectedProvider("all")}
              className={`flex items-center px-4 py-2 rounded-lg whitespace-nowrap ${
                selectedProvider === "all"
                  ? "bg-purple-100 text-purple-700 border border-purple-200"
                  : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
              }`}
            >
              <span className="mr-2">📱</span>
              All Models
            </button>
            {providers.map((provider) => (
              <button
                key={provider.id}
                onClick={() => setSelectedProvider(provider.id)}
                className={`flex items-center px-4 py-2 rounded-lg whitespace-nowrap ${
                  selectedProvider === provider.id
                    ? "bg-purple-100 text-purple-700 border border-purple-200"
                    : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
                }`}
              >
                <img
                  src={provider.icon}
                  alt={provider.name}
                  className="w-4 h-4 mr-2 rounded"
                />
                {provider.name}
              </button>
            ))}
          </div>
        </div>

        {/* Models Grid */}
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {selectedProvider === "all"
                ? "All AI Models"
                : providers.find((p) => p.id === selectedProvider)?.name +
                  " Models"}
            </h2>
            <div className="text-sm text-gray-500">
              {filteredModels.length} models found
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredModels.map((model) => (
              <div
                key={model.id}
                onClick={() => handleModelClick(model.id)}
                className="bg-white rounded-xl border border-gray-200 hover:border-purple-300 hover:shadow-md transition-all duration-200 cursor-pointer"
              >
                <div className="p-5">
                  {/* App Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl flex items-center justify-center text-xl mr-3">
                        {model.icon}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {model.name}
                        </h3>
                        <div className="flex items-center text-sm text-gray-500">
                          <img
                            src={model.providerIcon}
                            alt={model.provider}
                            className="w-3 h-3 mr-1 rounded"
                          />
                          {model.provider}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center bg-green-50 px-2 py-1 rounded">
                      <span className="text-green-600 font-semibold">
                        {model.rating}
                      </span>
                      <span className="text-yellow-400 ml-1">★</span>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {model.description}
                  </p>

                  {/* Category & Credits */}
                  <div className="flex justify-between items-center">
                    <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs font-medium">
                      {model.category}
                    </span>
                    <div className="text-sm font-semibold text-purple-600">
                      {model.credits} credits
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
            <div className="text-2xl font-bold text-gray-900">
              {allModels.length}
            </div>
            <div className="text-gray-500 text-sm">AI Models</div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
            <div className="text-2xl font-bold text-gray-900">
              {providers.length}
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
