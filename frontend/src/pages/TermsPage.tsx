import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";

const TermsPage = () => {
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
            Általános Szerződési Feltételek
          </h1>
          <p className="text-sm text-muted-foreground mb-8">Hatályos: 2026. március 18.</p>

          <div className="space-y-6 text-foreground/80 leading-relaxed">
            <section>
              <h2 className="text-lg font-semibold text-foreground mb-2">1. Szolgáltató adatai</h2>
              <p>
                A PlayENG 3000 online angol nyelvtanuló platform (a továbbiakban: Szolgáltatás)
                üzemeltetője: PlayENG (a továbbiakban: Szolgáltató).
              </p>
              <p>Weboldal: angolozzunk.hu</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mb-2">2. A Szolgáltatás leírása</h2>
              <p>
                A PlayENG 3000 egy online angol nyelvtanuló platform, amely az Oxford 3000
                leggyakrabban használt szó elsajátítására szolgál. A platform 973 szót, 23 tematikus
                fejezetet és 6 szintet tartalmaz, 4 feladattípussal (választós, mondatépítés,
                kiejtés, párbeszéd).
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mb-2">3. Regisztráció és fiók</h2>
              <p>
                A Szolgáltatás használatához regisztráció szükséges, amely Google, Facebook vagy
                Apple fiókkal történhet. A felhasználó felelős a fiókjához tartozó adatok
                valódiságáért és biztonságáért.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mb-2">4. Előfizetési feltételek</h2>
              <p>
                Az 1. szint (Basics) ingyenesen elérhető. A teljes tartalom eléréséhez
                prémium előfizetés szükséges. Az előfizetés havi díjas, és OTP SimplePay-en
                keresztül fizethető. Az előfizetés bármikor lemondható.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mb-2">5. Szellemi tulajdon</h2>
              <p>
                A platform tartalma (szövegek, feladatok, párbeszédek, design) szerzői jogi
                védelem alatt áll. A tartalom másolása, terjesztése vagy kereskedelmi célú
                felhasználása tilos.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mb-2">6. Felelősség korlátozása</h2>
              <p>
                A Szolgáltató nem vállal felelősséget a platform elérhetőségének időszakos
                szüneteltetéséből, technikai hibákból vagy harmadik fél szolgáltatásainak
                (Google, Facebook, Apple, SimplePay) működéséből eredő károkért.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mb-2">7. Elállási jog</h2>
              <p>
                A fogyasztó a digitális tartalom szolgáltatás megkezdését követően elveszíti
                az elállási jogát, amennyiben az előfizetés aktiválásával a szolgáltatás
                megkezdéséhez kifejezetten hozzájárult.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mb-2">8. Módosítás</h2>
              <p>
                A Szolgáltató fenntartja a jogot az ÁSZF egyoldalú módosítására. A változásokról
                a felhasználók e-mailben vagy az oldalon keresztül értesülnek.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mb-2">9. Kapcsolat</h2>
              <p>Kérdés, panasz: info@angolozzunk.hu</p>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default TermsPage;
