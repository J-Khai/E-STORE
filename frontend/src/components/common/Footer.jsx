import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  // simple grouping for the footer links
  const sections = [
    {
      title: "Navigation",
      links: [
        { label: "Home", path: "/" },
        { label: "Collections", path: "/products" },
        { label: "About Us", path: "/about" },
        { label: "Contact", path: "/contact" }
      ]
    },
    {
      title: "Customer Support",
      links: [
        { label: "Shipping Policy", path: "#" },
        { label: "Returns & Exchanges", path: "#" },
        { label: "FAQ", path: "#" },
        { label: "Order Tracking", path: "/profile/history" }
      ]
    },
    {
      title: "Legal",
      links: [
        { label: "Terms of Service", path: "#" },
        { label: "Privacy Policy", path: "#" },
        { label: "Compliance", path: "#" }
      ]
    }
  ];

  return (
    <footer className="bg-white border-t border-zinc-100 pt-20 pb-12 mt-20">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">

          {/* brand blurb */}
          <div className="space-y-6">
            <h2 className="text-xl font-bold tracking-tighter italic uppercase text-zinc-950">
              E-STORE
            </h2>
            <p className="label-mono text-[10px] leading-relaxed opacity-40 uppercase max-w-[240px]">
              providing modern essentials through curated design and sustainable manufacturing. direct shipping globally.
            </p>
            <div className="flex gap-4">
              {/* social social social */}
              {['Instagram', 'Twitter', 'Pinterest'].map(social => (
                <a key={social} href="#" className="w-8 h-8 rounded-full border border-zinc-100 flex items-center justify-center text-[10px] font-bold hover:bg-zinc-950 hover:text-white transition-all">
                  {social}
                </a>
              ))}
            </div>
          </div>

          {/* mapping through sections */}
          {sections.map(section => (
            <div key={section.title}>
              <h3 className="label-mono text-[11px] font-black uppercase tracking-widest text-zinc-950 mb-8 italic">
                {section.title}
              </h3>
              <ul className="space-y-4">
                {section.links.map(link => (
                  <li key={link.label}>
                    <Link to={link.path} className="text-[10px] uppercase font-bold text-zinc-950/40 hover:text-zinc-950 transition-colors tracking-widest">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* newsletter section */}
        <div className="divider-soft pt-12 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="max-w-md w-full">
            <p className="label-mono text-[9px] uppercase tracking-widest opacity-40 mb-4">join our internal newsletter</p>
            <form className="flex gap-2">
              <input
                type="email"
                placeholder="EMAIL@ADDRESS.COM"
                className="flex-1 bg-zinc-50 border border-zinc-100 px-4 py-3 text-[10px] font-bold uppercase tracking-widest focus:outline-none focus:border-zinc-950"
              />
              <button className="bg-zinc-950 text-white px-8 py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-zinc-800 transition-all">
                Submit
              </button>
            </form>
          </div>
          <div className="text-[9px] font-black uppercase tracking-[0.3em] opacity-20">
            © 2026 E-Store
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
