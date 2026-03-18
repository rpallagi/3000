import { motion } from "framer-motion";

const Hero = () => (
  <section className="w-full flex flex-col items-center justify-center pt-24 sm:pt-32 pb-16 sm:pb-20 px-5 sm:px-6">
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.23, 1, 0.32, 1] }}
      className="text-center max-w-3xl flex flex-col items-center gap-5 sm:gap-6"
    >
      <h1 className="text-4xl sm:text-5xl md:text-7xl font-semibold text-foreground leading-[1.08]">
        Az első lépés a legnehezebb.{" "}
        <span className="text-primary">Kezdd el ma.</span>
      </h1>
      <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground max-w-xl leading-relaxed">
        3000 szó. 0 magolás. Csak élő beszéd.
      </p>
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="mt-3 sm:mt-4 px-8 py-4 playeng-gradient text-white rounded-full text-lg font-medium
          hover:opacity-90 transition-opacity active:scale-95 shadow-lg"
      >
        Ingyenes próba
      </motion.button>
    </motion.div>
  </section>
);

export default Hero;
