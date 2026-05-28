const Footer = () => (
  <footer className="bg-white border-t border-gray-200 mt-auto">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-2">
      <p className="text-sm text-gray-500">
        &copy; {new Date().getFullYear()} MyEduConnect Sdn Bhd. All rights reserved.
      </p>
      <p className="text-xs text-gray-400">
        CCS6324 — Ethical Hacking &amp; Penetration Testing | Academic use only
      </p>
    </div>
  </footer>
);

export default Footer;


