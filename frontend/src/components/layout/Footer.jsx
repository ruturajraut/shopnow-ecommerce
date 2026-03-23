// frontend/src/components/layout/Footer.jsx

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <h3 className="text-xl font-bold text-white mb-3">🛒 ShopNow</h3>
            <p className="text-sm">
              Your one-stop shop for electronics, clothing, books and more.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-3">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="/" className="hover:text-white">Home</a></li>
              <li><a href="/products" className="hover:text-white">Products</a></li>
              <li><a href="/cart" className="hover:text-white">Cart</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-3">Contact</h4>
            <ul className="space-y-2 text-sm">
              <li>📧 support@shopnow.com</li>
              <li>📞 +91 8355826324</li>
              <li>📍 Panvel, India</li>
            </ul>
          </div>
        </div>

        <hr className="border-gray-700 my-6" />

        <p className="text-center text-sm">
          © {new Date().getFullYear()} ShopNow. Built with ❤️ by Ruturaj
        </p>
      </div>
    </footer>
  );
};

export default Footer;