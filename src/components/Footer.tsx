import { useEffect, useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { PhoneIcon } from "lucide-react";
import api from "../services/api";

const links = {
  Atelier: [
    { label: "The Crown", href: "#Crown" },
    { label: "The Canvas", href: "#Canvas" },
    { label: "Bespoke Process", href: "#Process" },
    { label: "Book a Fitting", href: "#Contact" },
  ],
  Company: [
    { label: "About Us", href: "#Manifesto" },

    { label: "Contact", href: "#Contact" },
  ],
};

function IconInstagram(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      {...props}
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function IconFacebook(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M14 9h3V6h-3c-1.93 0-3.5 1.57-3.5 3.5V11H8v3h2.5v7h3v-7H16l.5-3h-3V9.7c0-.4.3-.7.5-.7Z" />
    </svg>
  );
}

const SOCIALS = [
  { label: "Instagram", Icon: IconInstagram, href: "#" },
  { label: "Facebook", Icon: IconFacebook, href: "#" },
  {
    label: "Whatsapp",
    Icon: PhoneIcon,
    href: "https://wa.me/+2348033939296?text=Hello%20Ogechukwu",
  },
];

export default function Footer() {
  const heroRef = useRef<HTMLDivElement>(null);
  const linksRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    inquiry_type: "general",
    message: "",
  });

  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const els = [heroRef.current, linksRef.current].filter(
      Boolean,
    ) as HTMLElement[];
    els.forEach((el, i) => {
      el.classList.add("reveal");
      el.style.transitionDelay = `${i * 0.12}s`;
      const obs = new IntersectionObserver(
        ([e]) => {
          if (e.isIntersecting) {
            el.classList.add("visible");
            obs.unobserve(el);
          }
        },
        { threshold: 0.08 },
      );
      obs.observe(el);
      return () => obs.disconnect();
    });
  }, []);

  const mutation = useMutation({
    // Type the payload to match your state
    mutationFn: async (payload: typeof formData) => {
      // Axios automatically sets 'application/json' when you pass a plain object
      const response = await api.post("/contact-messages/", payload);
      return response.data;
    },
    onSuccess: () => {
      setSubmitted(true);
      setFormData({
        first_name: "",
        last_name: "",
        email: "",
        inquiry_type: "general",
        message: "",
      });
    },
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Pass the state object directly as a JSON payload
    mutation.mutate(formData);
  };

  return (
    <section id="Contact">
      <footer className="bg-fg text-bg overflow-hidden">
        {/* Contact hero */}
        <div
          ref={heroRef}
          className="py-[clamp(4rem,10vw,8rem)] px-[clamp(1.5rem,5vw,4rem)] border-b border-bg/10 text-center"
        >
          <p className="font-sans text-[0.6rem] tracking-[0.44em] uppercase text-accent mb-6">
            The Atelier
          </p>

          <h2 className="font-display font-black italic text-[clamp(2.5rem,10vw,7rem)] leading-[0.92] tracking-[-0.02em] text-bg mb-4">
            Start a
            <br />
            <span className="text-accent">conversation.</span>
          </h2>

          <p className="font-sans text-[clamp(0.85rem,1.8vw,1rem)] text-bg/55 leading-[1.7] max-w-[420px] mx-auto mt-6 mb-12">
            Inquire about a bespoke commission, ask about our collections, or
            simply get in touch with our team.
          </p>

          {!submitted ? (
            <form
              onSubmit={handleSubmit}
              className="max-w-[540px] mx-auto text-left flex flex-col"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <input
                  type="text"
                  name="first_name"
                  required
                  placeholder="First Name"
                  value={formData.first_name}
                  onChange={handleChange}
                  className="bg-transparent border-b border-bg/30 focus:border-accent outline-none font-sans text-[0.9rem] text-bg/90 py-3 transition-colors duration-300"
                />
                <input
                  type="text"
                  name="last_name"
                  required
                  placeholder="Last Name"
                  value={formData.last_name}
                  onChange={handleChange}
                  className="bg-transparent border-b border-bg/30 focus:border-accent outline-none font-sans text-[0.9rem] text-bg/90 py-3 transition-colors duration-300"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="Email Address"
                  value={formData.email}
                  onChange={handleChange}
                  className="bg-transparent border-b border-bg/30 focus:border-accent outline-none font-sans text-[0.9rem] text-bg/90 py-3 transition-colors duration-300"
                />
                <select
                  name="inquiry_type"
                  value={formData.inquiry_type}
                  onChange={handleChange}
                  className="bg-transparent border-b border-bg/30 focus:border-accent outline-none font-sans text-[0.9rem] text-bg/90 py-3 transition-colors duration-300 cursor-pointer appearance-none"
                >
                  <option value="general" className="bg-fg text-bg">
                    General Inquiry
                  </option>
                  <option value="bespoke_dress" className="bg-fg text-bg">
                    Bespoke Dress Commission
                  </option>
                </select>
              </div>

              <textarea
                name="message"
                required
                placeholder="How can we help you?"
                rows={3}
                value={formData.message}
                onChange={handleChange}
                className="bg-transparent border-b border-bg/30 focus:border-accent outline-none font-sans text-[0.9rem] text-bg/90 py-3 mb-8 transition-colors duration-300 resize-none"
              />

              <button
                type="submit"
                disabled={mutation.isPending}
                className="self-center bg-transparent border border-accent font-sans text-[0.68rem] tracking-[0.22em] uppercase text-accent cursor-pointer py-4 px-10 transition-all duration-300 hover:bg-accent hover:text-fg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {mutation.isPending ? "Sending..." : "Send Message"}
              </button>

              {mutation.isError && (
                <p className="text-red-400 font-sans text-sm text-center mt-4">
                  Something went wrong. Please try again.
                </p>
              )}
            </form>
          ) : (
            <div className="opacity-0 [animation:floatUp_0.5s_ease_forwards]">
              <p className="font-display italic text-[clamp(1.2rem,3vw,1.5rem)] text-accent">
                Thank you for reaching out. ✦
              </p>
              <p className="font-sans text-[0.85rem] text-bg/55 mt-4">
                Our team will get back to you shortly.
              </p>
            </div>
          )}
        </div>

        {/* Links grid + bottom bar */}
        <div
          ref={linksRef}
          className="pt-[clamp(3rem,6vw,5rem)] px-[clamp(1.5rem,5vw,4rem)] pb-[clamp(2rem,4vw,3rem)]"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 mb-[clamp(2.5rem,5vw,4rem)]">
            {/* Brand column */}
            <div>
              <h3 className="font-display font-black italic text-[clamp(1.5rem,4vw,2.2rem)] text-bg mb-4 leading-none">
                oggy<span className="text-accent">stitches</span>
              </h3>
              <p className="font-sans text-[0.85rem] text-bg/45 leading-[1.75] max-w-[280px] mb-6">
                Premium wigs & bespoke couture. Crafted for the extraordinary
                woman.
              </p>
              {/* Social */}
              <div className="flex gap-4">
                {SOCIALS.map(({ label, Icon, href }) => (
                  <a
                    key={label}
                    href={href}
                    aria-label={label}
                    target="_blank"
                    className="font-sans text-[0.6rem] tracking-[0.14em] text-bg/40 no-underline transition-colors duration-200 hover:text-accent"
                  >
                    <Icon width={20} height={20} />
                  </a>
                ))}
              </div>
            </div>

            {/* Link columns */}
            <div className="grid grid-cols-[repeat(auto-fit,minmax(100px,1fr))] gap-8 md:mt-0">
              {Object.entries(links).map(([cat, items]) => (
                <div key={cat}>
                  <p className="font-sans text-[0.6rem] tracking-[0.3em] uppercase text-accent mb-4">
                    {cat}
                  </p>
                  {items.map((item) => (
                    <a
                      key={item.label}
                      href={item.href}
                      className="block mb-[0.6rem] font-sans text-[0.82rem] text-bg/45 no-underline transition-colors duration-200 hover:text-bg/90"
                    >
                      {item.label}
                    </a>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Bottom bar */}
          <div className="flex justify-between items-center flex-wrap gap-4 border-t border-bg/10 pt-6">
            <p className="font-sans text-[0.68rem] text-bg/25 tracking-[0.06em]">
              © 2026 oggystitches. All rights reserved.
            </p>
            <div className="flex gap-2">
              <p className="font-sans text-[0.68rem] text-bg/25">Designed by</p>
              <a
                href="https://nwolisaodinaka.vercel.app"
                target="_blank"
                className="font-sans text-[0.68rem] text-bg/25 no-underline transition-colors duration-200 hover:text-bg/60"
              >
                Nwolisa Odinakachukwu
              </a>
            </div>
          </div>
        </div>
      </footer>
    </section>
  );
}
