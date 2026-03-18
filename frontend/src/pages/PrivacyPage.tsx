import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";

const PrivacyPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="pt-20 sm:pt-24 pb-24 sm:pb-20 px-4 sm:px-6 max-w-3xl mx-auto">
        <motion.button
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Vissza</span>
        </motion.button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="prose prose-sm max-w-none"
        >
          <h1 className="text-3xl font-semibold text-foreground mb-2">
            Adatvédelmi Szabályzat
          </h1>
          <p className="text-sm text-muted-foreground mb-8">Hatályos: 2026. március 18.</p>

          <div className="space-y-6 text-foreground/80 leading-relaxed">
            <section>
              <h2 className="text-lg font-semibold text-foreground mb-2">1. Adatkezelő</h2>
              <p>
                Az adatkezelő a PlayENG platform üzemeltetője (a továbbiakban: Adatkezelő).
                Kapcsolat: info@angolozzunk.hu
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mb-2">2. Kezelt személyes adatok</h2>
              <p>A platform az alábbi személyes adatokat kezeli:</p>
              <ul className="list-disc pl-5 space-y-1 mt-2">
                <li>Név és e-mail cím (OAuth regisztrációból)</li>
                <li>Tanulási haladás (fejezeteredmények, pontszámok)</li>
                <li>Hibaszótár (nehezebb szavak listája)</li>
                <li>Napi aktivitás (streak adatok)</li>
                <li>Előfizetési státusz</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mb-2">3. Az adatkezelés célja és jogalapja</h2>
              <ul className="list-disc pl-5 space-y-1 mt-2">
                <li><strong>Felhasználói fiók kezelése</strong> — a szolgáltatás nyújtásához szükséges (GDPR 6. cikk (1) b))</li>
                <li><strong>Tanulási haladás mentése</strong> — a felhasználó hozzájárulása alapján (GDPR 6. cikk (1) a))</li>
                <li><strong>AI Tutor visszajelzések</strong> — a szolgáltatás nyújtásához szükséges. A hibás szavak és pontszámok anonimizálva kerülnek az AI szolgáltatóhoz (Anthropic).</li>
                <li><strong>Fizetési adatok feldolgozása</strong> — az OTP SimplePay kezeli, a Szolgáltató nem tárol bankkártyaadatokat.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mb-2">4. Adatmegőrzés időtartama</h2>
              <p>
                A személyes adatokat a felhasználói fiók törléséig őrizzük meg.
                A fiók törlése után az adatok 30 napon belül véglegesen törlődnek.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mb-2">5. Adattovábbítás</h2>
              <p>A személyes adatokat az alábbi harmadik feleknek továbbítjuk:</p>
              <ul className="list-disc pl-5 space-y-1 mt-2">
                <li><strong>Google/Facebook/Apple</strong> — OAuth bejelentkezéshez (név, e-mail)</li>
                <li><strong>Anthropic (Claude AI)</strong> — AI Tutor funkciókhoz (anonimizált tanulási adatok)</li>
                <li><strong>OTP SimplePay</strong> — fizetés feldolgozásához</li>
                <li><strong>Cloudflare</strong> — weboldal védelméhez és kiszolgálásához</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mb-2">6. A felhasználó jogai</h2>
              <p>A GDPR alapján Önnek joga van:</p>
              <ul className="list-disc pl-5 space-y-1 mt-2">
                <li>Hozzáférni a személyes adataihoz</li>
                <li>Kérni az adatai helyesbítését vagy törlését</li>
                <li>Korlátozni vagy tiltakozni az adatkezelés ellen</li>
                <li>Adathordozhatóságot kérni</li>
                <li>Panaszt tenni a NAIH-nál (naih.hu)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mb-2">7. Sütik (Cookies)</h2>
              <p>
                A platform kizárólag a működéshez szükséges sütiket használ (session token,
                felhasználói beállítások). Nem használunk marketing vagy analitika sütiket.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mb-2">8. Adatbiztonság</h2>
              <p>
                Az adatokat titkosított HTTPS kapcsolaton keresztül továbbítjuk. Az adatbázis
                jelszóval védett, és csak az Adatkezelő szervere fér hozzá. A JWT tokenek
                rövid lejáratúak, és refresh tokennel frissülnek.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mb-2">9. Kapcsolat</h2>
              <p>
                Adatvédelmi kérdésekkel kapcsolatban írjon: info@angolozzunk.hu
              </p>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PrivacyPage;
