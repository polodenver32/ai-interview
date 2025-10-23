"use client";
import { useState } from "react";
import Head from "next/head";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTooltip, setActiveTooltip] = useState(null);

  const sections = [
    {
      title: "Featured AI Models",
      models: [
        {
          id: "gpt-4",
          name: "GPT-4",
          provider: "OpenAI",
          icon: "https://th.bing.com/th?q=Chatgpt+Logo+White+PNG&w=120&h=120&c=1&rs=1&qlt=70&o=7&cb=1&pid=InlineBlock&rm=3&mkt=en-IN&cc=IN&setlang=en&adlt=moderate&t=1&mw=247",
          description:
            "Advanced reasoning and complex problem solving with state-of-the-art AI capabilities for professional use cases",
          shortDescription: "Advanced reasoning & problem solving",
          rating: 4.9,
          credits: 5,
        },
        {
          id: "midjourney-v6",
          name: "MidJourney v6",
          provider: "MidJourney",
          icon: "https://th.bing.com/th?q=Mid-Journey+Logo+No+Background&w=120&h=120&c=1&rs=1&qlt=70&o=7&cb=1&pid=InlineBlock&rm=3&mkt=en-IN&cc=IN&setlang=en&adlt=moderate&t=1&mw=247",
          description:
            "Create stunning photorealistic images with enhanced realism, better lighting, and improved composition control",
          shortDescription: "Photorealistic image generation",
          rating: 4.9,
          credits: 10,
        },
        {
          id: "dall-e",
          name: "DALL-E 3",
          provider: "OpenAI",
          icon: "https://th.bing.com/th?q=Chatgpt+Logo+White+PNG&w=120&h=120&c=1&rs=1&qlt=70&o=7&cb=1&pid=InlineBlock&rm=3&mkt=en-IN&cc=IN&setlang=en&adlt=moderate&t=1&mw=247",
          description:
            "Generate high-quality images from text descriptions with creative control and artistic styles",
          shortDescription: "Text to image generation",
          rating: 4.8,
          credits: 8,
        },
        {
          id: "eleven-multilingual",
          name: "Eleven Multilingual",
          provider: "ElevenLabs",
          icon: "https://th.bing.com/th/id/ODLS.eb4d2bdc-b09b-4c2a-a542-b83c7d5afa00?w=32&h=32&o=6&cb=12&pid=AdsPlus",
          description:
            "Natural sounding text-to-speech synthesis supporting multiple languages with emotional tone control",
          shortDescription: "Multilingual text-to-speech",
          rating: 4.7,
          credits: 6,
        },
      ],
    },
    {
      title: "Top Charts",
      models: [
        {
          id: "deepseek-coder",
          name: "DeepSeek Coder",
          provider: "DeepSeek",
          icon: "https://th.bing.com/th/id/ODF.YxK1MUJaRoBfBG4UGNrXAA?w=32&h=32&qlt=90&pcl=fffffc&o=6&cb=12&pid=1.2",
          description:
            "AI assistant specialized for programming, code generation, debugging and technical documentation",
          shortDescription: "Programming & code generation",
          rating: 4.5,
          credits: 3,
        },
        {
          id: "whisper",
          name: "Whisper",
          provider: "OpenAI",
          icon: "https://th.bing.com/th?q=Chatgpt+Logo+White+PNG&w=120&h=120&c=1&rs=1&qlt=70&o=7&cb=1&pid=InlineBlock&rm=3&mkt=en-IN&cc=IN&setlang=en&adlt=moderate&t=1&mw=247",
          description:
            "Robust speech-to-text transcription supporting multiple languages with high accuracy and punctuation",
          shortDescription: "Speech-to-text transcription",
          rating: 4.6,
          credits: 3,
        },
        {
          id: "mistral-large",
          name: "Mistral Large",
          provider: "Mistral AI",
          icon: "https://th.bing.com/th/id/ODF.d2MUKyqVdf-YIWDLkq6srg?w=32&h=32&qlt=90&pcl=fffffa&o=6&cb=12&pid=1.2",
          description:
            "High-performance language model with excellent reasoning capabilities and multilingual support",
          shortDescription: "High-performance language model",
          rating: 4.6,
          credits: 4,
        },
        {
          id: "gen-2",
          name: "Gen-2",
          provider: "Runway",
          icon: "https://th.bing.com/th/id/ODF.lU0e8Zv_Hc2RxwgY3bXKDw?w=32&h=32&qlt=90&pcl=fffffa&o=6&cb=12&pid=1.2",
          description:
            "Transform text into stunning video content with cinematic quality and smooth motion generation",
          shortDescription: "Text to video generation",
          rating: 4.4,
          credits: 12,
        },
      ],
    },
    {
      title: "Language & Writing",
      models: [
        {
          id: "gpt-4",
          name: "GPT-4",
          provider: "OpenAI",
          icon: "https://th.bing.com/th?q=Chatgpt+Logo+White+PNG&w=120&h=120&c=1&rs=1&qlt=70&o=7&cb=1&pid=InlineBlock&rm=3&mkt=en-IN&cc=IN&setlang=en&adlt=moderate&t=1&mw=247",
          description:
            "Advanced reasoning and complex problem solving with state-of-the-art AI capabilities for professional use cases",
          shortDescription: "Advanced reasoning & problem solving",
          rating: 4.9,
          credits: 5,
        },
        {
          id: "gpt-3.5",
          name: "GPT-3.5 Turbo",
          provider: "OpenAI",
          icon: "https://th.bing.com/th?q=Chatgpt+Logo+White+PNG&w=120&h=120&c=1&rs=1&qlt=70&o=7&cb=1&pid=InlineBlock&rm=3&mkt=en-IN&cc=IN&setlang=en&adlt=moderate&t=1&mw=247",
          description:
            "Fast and efficient language model optimized for conversational AI and quick response generation",
          shortDescription: "Fast & efficient language model",
          rating: 4.7,
          credits: 2,
        },
        {
          id: "mistral-large",
          name: "Mistral Large",
          provider: "Mistral AI",
          icon: "https://th.bing.com/th/id/ODF.d2MUKyqVdf-YIWDLkq6srg?w=32&h=32&qlt=90&pcl=fffffa&o=6&cb=12&pid=1.2",
          description:
            "High-performance language model with excellent reasoning capabilities and multilingual support",
          shortDescription: "High-performance language model",
          rating: 4.6,
          credits: 4,
        },
      ],
    },
  ];

  const handleModelClick = (modelId) => {
    console.log(`Navigating to model: ${modelId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>AI Playstore - Unified AI Models Hub</title>
      </Head>

      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center mr-3">
                <span className="text-white font-bold text-sm">AI</span>
              </div>
              <h1 className="text-xl font-bold text-gray-900">AI Playstore</h1>
            </div>

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
        {sections.map((section, index) => (
          <div key={index} className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {section.title}
            </h2>

            <div className="flex space-x-4 overflow-x-auto pb-4 scrollbar-hide">
              {section.models.map((model) => (
                <div
                  key={model.id}
                  onClick={() => handleModelClick(model.id)}
                  className="group flex-shrink-0 w-48 bg-white rounded-xl p-4 hover:shadow-lg transition-all duration-200 cursor-pointer border border-gray-200 relative"
                >
                  <div
                    className="absolute top-3 right-3 w-5 h-5 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity text-xs font-bold"
                    onMouseEnter={() => setActiveTooltip(model.id)}
                    onMouseLeave={() => setActiveTooltip(null)}
                  >
                    i
                  </div>

                  {activeTooltip === model.id && (
                    <div className="absolute top-10 right-3 bg-black text-white p-3 rounded-lg text-sm max-w-xs z-20 shadow-xl">
                      {model.description}
                      <div className="absolute -top-1 right-3 w-2 h-2 bg-black rotate-45"></div>
                    </div>
                  )}

                  <div className="flex justify-center mb-3">
                    <img
                      src={model.icon}
                      alt={model.name}
                      className="w-16 h-16 rounded-2xl"
                    />
                  </div>

                  <h4 className="font-semibold text-gray-900 text-sm text-center mb-1">
                    {model.name}
                  </h4>

                  <p className="text-gray-500 text-xs text-center mb-2">
                    {model.provider}
                  </p>

                  <p className="text-gray-600 text-xs text-center mb-3 leading-tight min-h-[2rem] flex items-center justify-center">
                    {model.shortDescription}
                  </p>

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
          </div>
        ))}

        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
            <div className="text-2xl font-bold text-gray-900">
              {sections.flatMap((s) => s.models).length}
            </div>
            <div className="text-gray-500 text-sm">AI Models</div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
            <div className="text-2xl font-bold text-gray-900">6</div>
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
