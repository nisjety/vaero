// Description: Comprehensive about page for Væro weather application with detailed backend, AI, and technical information

'use client';

import React from 'react';
import { Cloud, Brain, Smartphone, Database, Cpu, Globe, Zap } from 'lucide-react';
import Link from 'next/link';

// Mock HeaderSection component since it's not available
const HeaderSection = ({ currentTime }: { currentTime: Date }) => (
  <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-sm border-b border-white/20 p-4">
    <div className="container mx-auto">
      <div className="flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-white hover:text-blue-300 transition-colors duration-200 cursor-pointer">
          Væro - Om Oss
        </Link>
        <div className="text-white text-sm">
          {currentTime.toLocaleTimeString('no-NO')}
        </div>
      </div>
    </div>
  </div>
);

export default function AboutPage() {
  const [currentTime, setCurrentTime] = React.useState(new Date());

  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="h-screen overflow-y-auto">
      {/* Header */}
      <HeaderSection currentTime={currentTime} />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-bold text-black mb-6">
              Om Væro
            </h1>
            <p className="text-xl text-black max-w-2xl mx-auto leading-relaxed">
              Den mest moderne værtjenesten i Norge med smart AI som gir deg personlige råd og vakre 3D-visualiseringer
            </p>
          </div>

          {/* Main Features Grid */}
          <div className="grid md:grid-cols-2 gap-8 mb-16">
            <div className="bg-blue-500/10 backdrop-blur-sm border border-blue-400/20 rounded-xl p-8 hover:bg-blue-500/15 transition-all duration-300">
              <h2 className="text-2xl font-bold text-black mb-4 flex items-center">
                <Cloud className="mr-3 text-blue-400" size={28} />
                Pålitelige Værdata
              </h2>
              <p className="text-black leading-relaxed">
                Vi bruker de samme værdataene som YR, direkte fra Meteorologisk institutt. 
                Du får alltid de mest oppdaterte og presise værmeldingene for hele Norge.
              </p>
            </div>

            <div className="bg-blue-500/10 backdrop-blur-sm border border-blue-400/20 rounded-xl p-8 hover:bg-blue-500/15 transition-all duration-300">
              <h2 className="text-2xl font-bold text-black mb-4 flex items-center">
                <Brain className="mr-3 text-purple-400" size={28} />
                Smart AI-assistent
              </h2>
              <p className="text-black leading-relaxed">
                Vår AI hjelper deg med å planlegge dagen. Den foreslår hvilke klær du bør ha på deg, 
                hvilke aktiviteter som passer været, og hva du bør pakke med deg på tur.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-8 hover:bg-white/15 transition-all duration-300">
              <h2 className="text-2xl font-bold text-black mb-4 flex items-center">
                <Globe className="mr-3 text-green-400" size={28} />
                Vakre 3D-animasjoner
              </h2>
              <p className="text-black leading-relaxed">
                Se været komme til live med flotte 3D-animasjoner. Skyer, regn og snø vises på en 
                visuell måte som gjør det lett å forstå hvordan været faktisk vil være.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-8 hover:bg-white/15 transition-all duration-300">
              <h2 className="text-2xl font-bold text-black mb-4 flex items-center">
                <Smartphone className="mr-3 text-pink-400" size={28} />
                Fungerer overalt
              </h2>
              <p className="text-black leading-relaxed">
                Væro fungerer perfekt på mobil, nettbrett og datamaskin. Appen er rask og enkel å bruke, 
                uansett hvilken enhet du bruker.
              </p>
            </div>
          </div>

          {/* Technical Architecture */}
          <div className="bg-blue-500/10 backdrop-blur-sm border border-blue-400/20 rounded-xl p-8 mb-16">
            <h2 className="text-3xl font-bold text-black mb-6 flex items-center">
              <Cpu className="mr-3 text-orange-400" size={32} />
              Hvordan Væro Fungerer
            </h2>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div>
                <h3 className="text-xl font-semibold text-blue-400 mb-3">Brukeropplevelse</h3>
                <ul className="text-black space-y-2 text-sm">
                  <li>• Moderne og rask nettside</li>
                  <li>• Fungerer på alle enheter</li>
                  <li>• Enkel å navigere</li>
                  <li>• Vakker design</li>
                  <li>• 3D-animasjoner</li>
                  <li>• Rask lasting</li>
                  <li>• Sikker innlogging</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold text-purple-400 mb-3">Bak Kulissene</h3>
                <ul className="text-black space-y-2 text-sm">
                  <li>• Kraftig server</li>
                  <li>• Sikker database</li>
                  <li>• Rask lagring</li>
                  <li>• Automatiske oppgaver</li>
                  <li>• Sikker drift</li>
                  <li>• Enkel API</li>
                  <li>• Kvalitetskontroll</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold text-green-400 mb-3">Datakilder</h3>
                <ul className="text-black space-y-2 text-sm">
                  <li>• Offisielle værdata</li>
                  <li>• Smart AI-assistent</li>
                  <li>• Læremaskin-modeller</li>
                  <li>• Språkforståelse</li>
                  <li>• Væralgorithmer</li>
                  <li>• Oppdatert informasjon</li>
                  <li>• Rask tilgang</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Data Sources */}
          <div className="bg-blue-500/10 backdrop-blur-sm border border-blue-400/20 rounded-xl p-8 mb-16">
            <h2 className="text-3xl font-bold text-black mb-6 flex items-center">
              <Database className="mr-3 text-cyan-400" size={32} />
              Hvor God Er Væro?
            </h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold text-cyan-400 mb-4">Våre Datakilder</h3>
                <div className="space-y-4">
                  <div className="bg-blue-500/5 rounded-lg p-4">
                    <h4 className="text-black font-semibold mb-2">Værdata</h4>
                    <p className="text-black text-sm">
                      Vi bruker de samme dataene som YR og storm.no. Dette er Norges mest pålitelige 
                      værtjeneste, som gir deg timesvise prognoser og når sola går opp og ned.
                    </p>
                  </div>
                  
                  <div className="bg-blue-500/5 rounded-lg p-4">
                    <h4 className="text-black font-semibold mb-2">Stedsinformasjon</h4>
                    <p className="text-black text-sm">
                      Appen finner automatisk hvor du er, eller du kan søke opp hvilken som helst plass 
                      i Norge for å få værmelding der.
                    </p>
                  </div>
                  
                  <div className="bg-blue-500/5 rounded-lg p-4">
                    <h4 className="text-black font-semibold mb-2">AI-hjelp</h4>
                    <p className="text-black text-sm">
                      Vår smarte assistent bruker avansert AI-teknologi for å gi deg personlige råd 
                      og tips basert på værprognosen.
                    </p>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold text-orange-400 mb-4">Hastighet & Pålitelighet</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center bg-blue-500/5 rounded-lg p-3">
                    <span className="text-black">Hvor raskt svarer appen?</span>
                    <span className="text-green-400 font-semibold">Lynraskt</span>
                  </div>
                  <div className="flex justify-between items-center bg-blue-500/5 rounded-lg p-3">
                    <span className="text-black">Hvor ofte fungerer den?</span>
                    <span className="text-green-400 font-semibold">Nesten alltid</span>
                  </div>
                  <div className="flex justify-between items-center bg-blue-500/5 rounded-lg p-3">
                    <span className="text-black">Hvor ofte oppdateres været?</span>
                    <span className="text-blue-400 font-semibold">Hver 10. minutt</span>
                  </div>
                  <div className="flex justify-between items-center bg-blue-500/5 rounded-lg p-3">
                    <span className="text-black">Er tjenesten stabil?</span>
                    <span className="text-green-400 font-semibold">Veldig stabil</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 3D Visualization & Backend Details */}
          <div className="bg-blue-500/10 backdrop-blur-sm border border-blue-400/20 rounded-xl p-8 mb-16">
            <h2 className="text-3xl font-bold text-black mb-6 flex items-center">
              <Zap className="mr-3 text-yellow-400" size={32} />
              Vakre Animasjoner og Sikker Drift
            </h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold text-yellow-400 mb-4">3D-Animasjoner</h3>
                <p className="text-black mb-4">
                  Se været i flotte 3D-animasjoner som gjør det enkelt å forstå:
                </p>
                <ul className="text-black space-y-2 text-sm">
                  <li>• Realistiske skyer som beveger seg</li>
                  <li>• Regn og snø som ser ekte ut</li>
                  <li>• Vakker himmel og atmosfære</li>
                  <li>• Du kan bevege kameraet rundt</li>
                  <li>• Fungerer på mobil og datamaskin</li>
                  <li>• Smooth og flytende animasjoner</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold text-red-400 mb-4">Sikker og Pålitelig</h3>
                <p className="text-black mb-4">
                  Væro er bygget for å være trygg og pålitelig:
                </p>
                <ul className="text-black space-y-2 text-sm">
                  <li>• Moderne og sikker teknologi</li>
                  <li>• Trygg oppbevaring av data</li>
                  <li>• Rask og effektiv lagring</li>
                  <li>• Sikker innlogging</li>
                  <li>• Beskyttelse mot misbruk</li>
                  <li>• Automatisk testing av kvalitet</li>
                  <li>• Enkel å kjøre og vedlikeholde</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Mission Statement */}
          <div className="text-center bg-blue-600/20 backdrop-blur-sm border border-blue-400/20 rounded-xl p-8">
            <h2 className="text-3xl font-bold text-black mb-6">
              Værtjenesten for Nordmenn
            </h2>
            <p className="text-black text-lg leading-relaxed mb-6">
              Væro er laget spesielt for Norge og norske væforhold. Vi kombinerer pålitelige værdata 
              med smart AI og vakre animasjoner for å gi deg den beste væropplevelsen.
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm text-black">
              <span className="bg-blue-500/10 px-3 py-1 rounded-full">• Pålitelige værdata</span>
              <span className="bg-blue-500/10 px-3 py-1 rounded-full">• Smart AI-hjelp</span>
              <span className="bg-blue-500/10 px-3 py-1 rounded-full">• Vakre animasjoner</span>
              <span className="bg-blue-500/10 px-3 py-1 rounded-full">• På norsk</span>
              <span className="bg-blue-500/10 px-3 py-1 rounded-full">• Gratis å bruke</span>
            </div>
            <div className="mt-6">
              <p className="text-black mb-4">
                Prøv Væro i dag!
              </p>
              <p className="text-black text-sm max-w-2xl mx-auto">
                Væro gjør det enkelt å planlegge dagen din. Med smart AI og vakre animasjoner 
                får du en væropplevelse som er både nyttig og hyggelig å bruke.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}