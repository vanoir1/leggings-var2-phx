import { useState, useEffect } from 'react'
import './App.css'
import { createCartAndRedirect, preloadVariantCache } from './services/shopify-cart'

// Declare global tracking objects
declare global {
  interface Window {
    fbq: any;
    gtag: any;
    ttq: any;
    nbpix: any;
  }
}

// Product info for tracking
const PRODUCT_INFO = {
  content_name: 'High-Waist Seamless Leggings',
  content_category: 'Apparel & Accessories > Clothing > Activewear',
  content_ids: ['leggings-seamless'],
  content_type: 'product',
  currency: 'USD',
}

// Track ViewContent event on all pixels
const trackViewContent = (value: number) => {
  // Facebook Pixel
  if (typeof window.fbq === 'function') {
    window.fbq('track', 'ViewContent', {
      ...PRODUCT_INFO,
      value: value,
    });
  }

  // Google Analytics 4
  if (typeof window.gtag === 'function') {
    window.gtag('event', 'view_item', {
      currency: 'USD',
      value: value,
      items: [{
        item_id: 'leggings-seamless',
        item_name: PRODUCT_INFO.content_name,
        item_category: 'Activewear',
        price: value,
      }]
    });
  }

  // TikTok Pixel
  if (typeof window.ttq === 'object' && window.ttq.track) {
    window.ttq.track('ViewContent', {
      content_id: 'leggings-seamless',
      content_name: PRODUCT_INFO.content_name,
      content_type: 'product',
      value: value,
      currency: 'USD',
    });
  }

  // NewsBreak Pixel
  if (typeof window.nbpix === 'function') {
    window.nbpix('event', 'view_content', {
      content_name: PRODUCT_INFO.content_name,
      value: value,
    });
  }

  console.log('ViewContent tracked:', { value });
}

// Track AddToCart event on all pixels
const trackAddToCart = (color: string, size: string, bundle: string, value: number, quantity: number) => {
  const params = {
    ...PRODUCT_INFO,
    value: value,
    content_name: `${PRODUCT_INFO.content_name} - ${color} - ${size} - ${bundle}`,
    num_items: quantity,
  };

  // Facebook Pixel
  if (typeof window.fbq === 'function') {
    window.fbq('track', 'AddToCart', params);
  }

  // Google Analytics 4
  if (typeof window.gtag === 'function') {
    window.gtag('event', 'add_to_cart', {
      currency: 'USD',
      value: value,
      items: [{
        item_id: 'leggings-seamless',
        item_name: PRODUCT_INFO.content_name,
        item_category: 'Activewear',
        item_variant: `${color} / ${size}`,
        price: value,
        quantity: quantity,
      }]
    });
  }

  // TikTok Pixel
  if (typeof window.ttq === 'object' && window.ttq.track) {
    window.ttq.track('AddToCart', {
      content_id: 'leggings-seamless',
      content_name: PRODUCT_INFO.content_name,
      content_type: 'product',
      value: value,
      currency: 'USD',
      quantity: quantity,
    });
  }

  // NewsBreak Pixel
  if (typeof window.nbpix === 'function') {
    window.nbpix('event', 'add_to_cart', {
      content_name: PRODUCT_INFO.content_name,
      value: value,
      quantity: quantity,
    });
  }

  console.log('AddToCart tracked:', { color, size, bundle, value, quantity });
}

const PRODUCT_IMAGES = [
  '/assets/hero1.webp',
  '/assets/hero2.webp',
  '/assets/hero3.webp',
  '/assets/hero4.webp',
  '/assets/hero5.webp',
  '/assets/hero6.webp',
  '/assets/hero7.webp',
  '/assets/hero8.webp',
  '/assets/hero9.webp',
  '/assets/hero10.webp',
  '/assets/hero11.webp'
]

const COLORS = [
  { name: 'Black', hex: '#1a1a1a', class: 'bg-[#1a1a1a]' },
  { name: 'Navy', hex: '#1e3a5f', class: 'bg-[#1e3a5f]' },
  { name: 'Gray', hex: '#6b7280', class: 'bg-[#6b7280]' },
  { name: 'Yellow', hex: '#fbbf24', class: 'bg-[#fbbf24]' },
  { name: 'Pink', hex: '#ec4899', class: 'bg-[#ec4899]' }
]

const SIZES = ['XS', 'S', 'M', 'L', 'XL', '2XL']

const BUNDLES = [
  {
    id: 'starter',
    name: '1 Pair',
    shopifyName: '1 Pack',
    subtitle: 'Try It Out',
    quantity: 1,
    price: 19.99,
    originalPrice: 29.99,
    perItem: 19.99,
    savings: null,
    badge: null,
    popular: false,
    freeText: null
  },
  {
    id: 'popular',
    name: '3 Pairs',
    shopifyName: '5 Pack',
    subtitle: 'Most Popular',
    quantity: 3,
    price: 44.99,
    originalPrice: 89.97,
    perItem: 14.99,
    savings: 'SAVE $45',
    badge: 'Best Seller',
    popular: true,
    freeText: 'Buy 2 Get 1 FREE'
  },
  {
    id: 'value',
    name: '5 Pairs',
    shopifyName: '10 Pack',
    subtitle: 'Best Value',
    quantity: 5,
    price: 59.99,
    originalPrice: 149.95,
    perItem: 11.99,
    savings: 'SAVE $90',
    badge: 'Best Value',
    popular: false,
    freeText: 'Buy 3 Get 2 FREE'
  },
  {
    id: 'ultimate',
    name: '10 Pairs',
    shopifyName: '10 Pack',
    subtitle: 'Ultimate Bundle',
    quantity: 10,
    price: 99.99,
    originalPrice: 299.90,
    perItem: 9.99,
    savings: 'SAVE $200',
    badge: 'Ultimate',
    popular: false,
    freeText: 'Buy 5 Get 5 FREE'
  }
]

const REVIEWS = [
  { name: 'Ashley M.', rating: 5, text: "Finally found leggings that don't roll down during squats! Worth every penny.", avatar: '👩🏻', verified: true },
  { name: 'Brittany K.', rating: 5, text: 'TikTok made me buy these and no regrets. They actually passed the squat test!', avatar: '👩🏽', verified: true },
  { name: 'Jessica T.', rating: 5, text: "My post-baby body finally has leggings that fit. The high waist is chef's kiss.", avatar: '👩🏼', verified: true },
  { name: 'Maria L.', rating: 5, text: "I'm 5'4 145lbs and the medium fits perfectly. So flattering!", avatar: '👩🏻', verified: true },
  { name: 'Taylor R.', rating: 5, text: 'Bought these for gym and I literally live in them now. Ordering more colors!', avatar: '👩🏾', verified: true }
]

const VIDEO_TESTIMONIALS = [
  { video: '/video-1.mp4', poster: '/thumbnail-1.webp' },
  { video: '/video-2.mp4', poster: '/thumbnail-2.webp' },
  { video: '/video-3.mp4', poster: '/thumbnail-3.webp' },
  { video: '/video-4.mp4', poster: '/thumbnail-4.webp' },
]

const SIZE_GUIDE_DATA = [
  { size: 'XS', dress: '0-2', waist: '24-26"', hip: '34-36"' },
  { size: 'S', dress: '4-6', waist: '26-28"', hip: '36-38"' },
  { size: 'M', dress: '8-10', waist: '28-30"', hip: '38-40"' },
  { size: 'L', dress: '12-14', waist: '30-32"', hip: '40-42"' },
  { size: 'XL', dress: '16-18', waist: '32-34"', hip: '42-44"' },
  { size: '2XL', dress: '20-22', waist: '34-36"', hip: '44-46"' },
]

const FEATURE_CARDS = [
  { image: '/features/flat-tummy.webp', title: 'Tummy Control', desc: 'High-waist compression for a smooth, flattering silhouette' },
  { image: '/features/lift-effect.webp', title: 'Instant Lift', desc: 'Strategically placed seams that lift and shape naturally' },
  { image: '/features/comfort.webp', title: 'All-Day Comfort', desc: 'Buttery soft fabric that moves with you, not against you' },
  { image: '/features/slimming.webp', title: 'Slimming Effect', desc: 'Contouring design that hugs your curves beautifully' },
]

function App() {
  const [selectedColor, setSelectedColor] = useState(COLORS[0])
  const [selectedSize, setSelectedSize] = useState('M')
  const [selectedBundle, setSelectedBundle] = useState(BUNDLES[1])
  const [currentImage, setCurrentImage] = useState(0)
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [showSizeGuide, setShowSizeGuide] = useState(false)

  // Swipe handlers
  const minSwipeDistance = 50
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
  }
  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }
  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > minSwipeDistance
    const isRightSwipe = distance < -minSwipeDistance
    if (isLeftSwipe) {
      setCurrentImage(prev => prev < PRODUCT_IMAGES.length - 1 ? prev + 1 : 0)
    } else if (isRightSwipe) {
      setCurrentImage(prev => prev > 0 ? prev - 1 : PRODUCT_IMAGES.length - 1)
    }
  }
  const [showSticky, setShowSticky] = useState(false)
  const [activeVideo, setActiveVideo] = useState<string | null>(null)
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false)

  useEffect(() => {
    preloadVariantCache()
    setIsLoaded(true)

    // Track ViewContent on page load
    trackViewContent(selectedBundle.price)

    const handleScroll = () => {
      setShowSticky(window.scrollY > 600)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleAddToCart = async () => {
    setIsCheckoutLoading(true)
    try {
      // Track AddToCart event before checkout
      trackAddToCart(
        selectedColor.name,
        selectedSize,
        selectedBundle.name,
        selectedBundle.price,
        selectedBundle.quantity
      )

      console.log('Checkout attempt:', { color: selectedColor.name, size: selectedSize, bundle: selectedBundle.shopifyName })
      const checkoutUrl = await createCartAndRedirect(
        selectedColor.name,
        selectedSize,
        selectedBundle.shopifyName
      )
      console.log('Checkout URL:', checkoutUrl)
      window.location.href = checkoutUrl
    } catch (error: any) {
      console.error('Checkout error:', error?.message || error)
      alert('Checkout error: ' + (error?.message || 'Please try again.'))
    } finally {
      setIsCheckoutLoading(false)
    }
  }

  return (
    <div className={`min-h-screen bg-[#FDF5F7] overflow-x-hidden ${isLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-700`}>
      {/* Announcement Bar */}
      <div className="bg-[#4A3540] text-white py-2 px-4 text-center text-sm font-medium tracking-wide">
        <span className="animate-pulse inline-block mr-2">✨</span>
        FREE SHIPPING ON ORDERS $50+ | SQUAT-PROOF GUARANTEE
        <span className="animate-pulse inline-block ml-2">✨</span>
      </div>

      {/* Header */}
      <header className="h-[56px] md:h-[64px] bg-white border-b border-slate-200/50">
        <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-center">
          <img src="/logo.png" alt="Vanoir" className="h-7 md:h-9" />
        </div>
      </header>

      {/* Hero Section */}
      <section id="hero" className="relative overflow-hidden w-full">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-8 lg:py-16">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            {/* Image Gallery */}
            <div className="relative w-full max-w-[85vw] sm:max-w-sm md:max-w-md mx-auto lg:max-w-none">
              <div
                className="aspect-[3/4] sm:aspect-[4/5] rounded-2xl sm:rounded-3xl overflow-hidden bg-[#B8D4E8]/20 shadow-xl sm:shadow-2xl cursor-grab active:cursor-grabbing"
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
              >
                <img
                  src={PRODUCT_IMAGES[currentImage]}
                  alt="Seamless High-Waist Leggings"
                  className="w-full h-full object-cover transition-transform duration-300 pointer-events-none select-none"
                />
                {/* Trust Badge */}
                <div className="absolute top-2 left-2 sm:top-4 sm:left-4 bg-white/90 backdrop-blur-sm px-2 py-1 sm:px-3 sm:py-1.5 rounded-full shadow-lg">
                  <span className="text-[10px] sm:text-xs font-semibold text-[#4A3540]">⭐ 4.9/5 (2,847 reviews)</span>
                </div>
                {/* Sale Badge */}
                <div className="absolute top-2 right-2 sm:top-4 sm:right-4 bg-[#E8A0B5] text-white px-2 py-1 sm:px-3 sm:py-1.5 rounded-full shadow-lg animate-bounce">
                  <span className="text-[10px] sm:text-xs font-bold">SAVE UP TO $100</span>
                </div>
              </div>
              {/* Swipe indicator dots */}
              <div className="flex justify-center gap-1.5 mt-3 sm:hidden">
                {PRODUCT_IMAGES.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImage(idx)}
                    className={`w-2 h-2 rounded-full transition-all ${currentImage === idx ? "bg-[#E8A0B5] w-4" : "bg-gray-300"}`}
                  />
                ))}
              </div>
              {/* Thumbnails - scrollable on mobile */}
              <div className="flex gap-1.5 sm:gap-2 mt-3 sm:mt-4 overflow-x-auto pb-2 px-0.5 snap-x snap-mandatory" style={{scrollbarWidth: "none", msOverflowStyle: "none", WebkitOverflowScrolling: "touch"}}>
                {PRODUCT_IMAGES.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImage(idx)}
                    className={`w-12 h-12 sm:w-14 sm:h-16 md:w-16 md:h-20 rounded-md sm:rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 snap-center ${
                      currentImage === idx ? 'border-[#E8A0B5] scale-105' : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover"/>
                  </button>
                ))}
              </div>
            </div>

            {/* Product Info */}
            <div className="space-y-4 sm:space-y-6">
              <div>
                <p className="text-[#E8A0B5] font-semibold tracking-widest text-xs sm:text-sm mb-1 sm:mb-2">VIRAL ON TIKTOK</p>
                <h1 className="font-['Fraunces'] text-2xl sm:text-3xl lg:text-5xl font-bold text-[#4A3540] leading-tight">
                  High-Waist Seamless Leggings
                </h1>
                <p className="text-base sm:text-xl text-[#4A3540]/70 mt-2 sm:mt-3 font-light">
                  The squat-proof, butt-lifting leggings everyone is obsessed with
                </p>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-3">
                <span className="text-2xl sm:text-4xl font-bold text-[#4A3540]">${selectedBundle.price}</span>
                {selectedBundle.savings && (
                  <>
                    <span className="text-xl text-[#4A3540]/40 line-through">${(19.99 * selectedBundle.quantity).toFixed(2)}</span>
                    <span className="bg-[#B8D4E8] text-[#4A3540] px-2 py-0.5 rounded-full text-sm font-semibold">
                      {selectedBundle.savings}
                    </span>
                  </>
                )}
              </div>

              {/* Color Selector */}
              <div>
                <p className="font-medium text-[#4A3540] mb-3">Color: <span className="font-normal">{selectedColor.name}</span></p>
                <div className="flex gap-3">
                  {COLORS.map((color) => (
                    <button
                      key={color.name}
                      onClick={() => setSelectedColor(color)}
                      className={`w-10 h-10 rounded-full ${color.class} border-2 transition-all ${
                        selectedColor.name === color.name
                          ? 'border-[#4A3540] scale-110 ring-2 ring-offset-2 ring-[#E8A0B5]/40'
                          : 'border-white/50 hover:scale-105'
                      }`}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>

              {/* Size Selector */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <p className="font-medium text-[#4A3540]">Size: <span className="font-normal">{selectedSize}</span></p>
                  <button
                    onClick={() => setShowSizeGuide(true)}
                    className="text-sm text-[#E8A0B5] underline underline-offset-2 hover:text-[#4A3540] transition-colors"
                  >
                    Size Guide
                  </button>
                </div>
                <div className="grid grid-cols-6 gap-2">
                  {SIZES.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`py-3 rounded-xl font-medium transition-all ${
                        selectedSize === size
                          ? 'bg-[#4A3540] text-white'
                          : 'bg-white border border-[#4A3540]/20 hover:border-[#E8A0B5] text-[#4A3540]'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Bundle Selector */}
              <div>
                <p className="font-medium text-[#4A3540] mb-2">Bundle & Save:</p>
                <div className="flex flex-col gap-2">
                  {BUNDLES.map((bundle) => (
                    <button
                      key={bundle.id}
                      onClick={() => setSelectedBundle(bundle)}
                      className={`px-4 py-3 rounded-xl border-2 transition-all flex items-center justify-between ${
                        selectedBundle.id === bundle.id
                          ? 'border-[#E8A0B5] bg-[#E8A0B5]/10'
                          : 'border-[#4A3540]/10 hover:border-[#E8A0B5]/50 bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                          selectedBundle.id === bundle.id ? 'border-[#E8A0B5]' : 'border-[#4A3540]/30'
                        }`}>
                          {selectedBundle.id === bundle.id && <div className="w-2 h-2 rounded-full bg-[#E8A0B5]" />}
                        </div>
                        <div className="text-left">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-[#4A3540]">{bundle.name}</span>
                            {bundle.badge && (
                              <span className="bg-[#E8A0B5] text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                                {bundle.badge}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-xs">
                            {bundle.freeText && <span className="text-green-600 font-semibold">{bundle.freeText}</span>}
                            {bundle.quantity > 1 && <span className="text-[#4A3540]/50">${bundle.perItem}/pair</span>}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-[#4A3540] text-lg">${bundle.price}</span>
                        {bundle.savings && (
                          <span className="ml-2 text-green-600 text-xs font-bold">{bundle.savings}</span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* CTA Button */}
              <button
                onClick={handleAddToCart}
                disabled={isCheckoutLoading}
                className="w-full bg-[#E8A0B5] hover:bg-[#d88fa4] text-white py-3 sm:py-5 rounded-xl sm:rounded-2xl font-bold text-base sm:text-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-[#E8A0B5]/30 disabled:opacity-50"
              >
                {isCheckoutLoading ? 'PROCESSING...' : `ADD TO CART - $${selectedBundle.price}`}
              </button>

              {/* Trust Icons */}
              <div className="flex justify-center gap-6 pt-4 text-[#4A3540]/60 text-sm">
                <div className="flex items-center gap-1.5">
                  <span>🚚</span> Free Shipping $50+
                </div>
                <div className="flex items-center gap-1.5">
                  <span>↩️</span> 30-Day Returns
                </div>
                <div className="flex items-center gap-1.5">
                  <span>🔒</span> Secure Checkout
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Bar */}
      <section id="social-proof" className="bg-[#4A3540] py-6 overflow-hidden">
        <div className="flex animate-marquee whitespace-nowrap">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center gap-12 mx-6">
              <span className="text-white/90 font-medium">⭐⭐⭐⭐⭐ 2,847+ 5-Star Reviews</span>
              <span className="text-white/60">|</span>
              <span className="text-white/90 font-medium">📦 50,000+ Happy Customers</span>
              <span className="text-white/60">|</span>
              <span className="text-white/90 font-medium">✨ As Seen on TikTok</span>
              <span className="text-white/60">|</span>
              <span className="text-white/90 font-medium">✅ Squat-Proof Guarantee</span>
              <span className="text-white/60">|</span>
            </div>
          ))}
        </div>
      </section>

      {/* Video Testimonials Section */}
      <section id="videos" className="py-16 lg:py-24 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-['Fraunces'] text-3xl lg:text-4xl font-bold text-center text-[#4A3540] mb-4">
            See It In Action
          </h2>
          <p className="text-center text-[#4A3540]/60 mb-10 max-w-2xl mx-auto">
            Real customers showing off their leggings in real life
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {VIDEO_TESTIMONIALS.map((item, idx) => (
              <div
                key={idx}
                onClick={() => setActiveVideo(item.video)}
                className="relative aspect-[9/16] rounded-2xl overflow-hidden cursor-pointer group shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]"
              >
                <img src={item.poster} alt="Video testimonial" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                  <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <div className="w-0 h-0 border-t-[10px] border-t-transparent border-l-[16px] border-l-[#E8A0B5] border-b-[10px] border-b-transparent ml-1" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Butt-Lifting Hero Section */}
      <section id="butt-lifting" className="py-16 lg:py-24 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl">
              <img
                src="/features/butt-lifting.webp"
                alt="Butt-Lifting Design"
                className="w-full h-auto"
              />
            </div>
            <div className="space-y-6">
              <span className="inline-block bg-[#E8A0B5]/20 text-[#E8A0B5] px-4 py-1.5 rounded-full text-sm font-semibold">
                SIGNATURE FEATURE
              </span>
              <h2 className="font-['Fraunces'] text-3xl lg:text-4xl font-bold text-[#4A3540]">
                Butt-Lifting Design
              </h2>
              <p className="text-[#4A3540]/70 text-lg">
                Our signature ruched back seam creates a natural lift that enhances your curves without being over the top. It's subtle, flattering, and makes you feel amazing.
              </p>
              <ul className="space-y-3">
                {[
                  'Strategically placed center seam',
                  'Enhances natural curves',
                  'Comfortable for all-day wear',
                  'No awkward adjusting needed'
                ].map((item, idx) => (
                  <li key={idx} className="flex items-center gap-3 text-[#4A3540]">
                    <span className="w-6 h-6 rounded-full bg-[#B8D4E8] flex items-center justify-center text-white text-sm">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Squat-Proof Hero Section */}
      <section id="squat-proof" className="py-16 lg:py-24 px-4 bg-[#FDF5F7]">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            <div className="space-y-6 order-2 lg:order-1">
              <span className="inline-block bg-[#B8D4E8]/30 text-[#4A3540] px-4 py-1.5 rounded-full text-sm font-semibold">
                OUR PROMISE
              </span>
              <h2 className="font-['Fraunces'] text-3xl lg:text-4xl font-bold text-[#4A3540]">
                100% Squat-Proof Guarantee
              </h2>
              <p className="text-[#4A3540]/70 text-lg">
                We've tested these under bright gym lights, during hot yoga, and through every squat variation. The verdict? Completely opaque, every single time.
              </p>
              <ul className="space-y-3">
                {[
                  'Double-layer opacity protection',
                  'Tested under studio lighting',
                  'Zero see-through moments',
                  'Full refund if not satisfied'
                ].map((item, idx) => (
                  <li key={idx} className="flex items-center gap-3 text-[#4A3540]">
                    <span className="w-6 h-6 rounded-full bg-[#E8A0B5] flex items-center justify-center text-white text-sm">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative rounded-3xl overflow-hidden shadow-2xl order-1 lg:order-2">
              <img
                src="/features/squat-proof.webp"
                alt="Squat-Proof Guarantee"
                className="w-full h-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Section */}
      <section id="comparison" className="bg-white py-16 lg:py-24 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-['Fraunces'] text-3xl lg:text-4xl font-bold text-center text-[#4A3540] mb-12">
            $19.99 vs $98 Designer Brands
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-[#FDF5F7] p-8 rounded-3xl border-2 border-[#E8A0B5]">
              <div className="text-center mb-6">
                <span className="bg-[#E8A0B5] text-white px-4 py-1 rounded-full text-sm font-bold">OUR LEGGINGS</span>
                <p className="text-2xl sm:text-4xl font-bold text-[#4A3540] mt-4">$19.99</p>
              </div>
              <ul className="space-y-3">
                {['Squat-proof fabric', 'High-waist compression', 'Butt-lifting design', 'Seamless construction', 'Same quality, 80% less'].map((item, idx) => (
                  <li key={idx} className="flex items-center gap-3 text-[#4A3540]">
                    <span className="text-[#B8D4E8] text-xl">✓</span> {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-gray-100 p-8 rounded-3xl opacity-60">
              <div className="text-center mb-6">
                <span className="bg-gray-400 text-white px-4 py-1 rounded-full text-sm font-bold">DESIGNER BRAND</span>
                <p className="text-2xl sm:text-4xl font-bold text-gray-500 mt-4">$98+</p>
              </div>
              <ul className="space-y-3">
                {['Squat-proof fabric', 'High-waist compression', 'Butt-lifting design', 'Seamless construction', 'Paying for the logo'].map((item, idx) => (
                  <li key={idx} className="flex items-center gap-3 text-gray-500">
                    <span className="text-gray-400 text-xl">{idx === 4 ? '✗' : '✓'}</span> {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section id="reviews" className="py-16 lg:py-24 px-4 bg-[#FDF5F7]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-['Fraunces'] text-3xl lg:text-4xl font-bold text-[#4A3540] mb-4">
              What Real Customers Say
            </h2>
            <div className="flex justify-center items-center gap-2">
              <span className="text-2xl">⭐⭐⭐⭐⭐</span>
              <span className="text-[#4A3540] font-medium">4.9/5 from 2,847 reviews</span>
            </div>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {REVIEWS.map((review, idx) => (
              <div key={idx} className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl">{review.avatar}</span>
                  <div>
                    <p className="font-semibold text-[#4A3540]">{review.name}</p>
                    {review.verified && (
                      <p className="text-xs text-[#B8D4E8]">✓ Verified Buyer</p>
                    )}
                  </div>
                </div>
                <div className="text-[#F5C6D6] mb-3">{'⭐'.repeat(review.rating)}</div>
                <p className="text-[#4A3540]/80">{review.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Cards Grid - Photo Driven */}
      <section id="features" className="py-16 lg:py-24 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-['Fraunces'] text-3xl lg:text-4xl font-bold text-center text-[#4A3540] mb-4">
            Why Everyone is Obsessed
          </h2>
          <p className="text-center text-[#4A3540]/60 mb-12 max-w-2xl mx-auto">
            These aren't just leggings. They're your new confidence uniform.
          </p>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            {FEATURE_CARDS.map((feature, idx) => (
              <div key={idx} className="group relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="aspect-[3/4]">
                  <img
                    src={feature.image}
                    alt={feature.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-[#4A3540]/90 via-[#4A3540]/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-5 text-white">
                  <h3 className="font-semibold text-sm sm:text-lg mb-0.5 sm:mb-1">{feature.title}</h3>
                  <p className="text-white/80 text-xs sm:text-sm hidden sm:block">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How to Wear Section */}
      <section id="how-to-wear" className="py-0">
        <img
          src="/features/how-to-wear.webp"
          alt="How to Wear"
          className="w-full h-auto"
        />
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-16 lg:py-24 px-4 bg-[#FDF5F7]">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-['Fraunces'] text-3xl lg:text-4xl font-bold text-center text-[#4A3540] mb-12">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {[
              { q: 'Are these really squat-proof?', a: "Absolutely! Our fabric is designed to stay opaque even during your deepest squats. We've tested it under bright gym lights — no see-through worries." },
              { q: 'What size should I get?', a: "We recommend ordering your usual size. The seamless fabric has great stretch. If you're between sizes, size up for a looser fit or down for more compression." },
              { q: 'How long does shipping take?', a: 'We ship within 1-2 business days. Standard shipping takes 5-7 days, and express shipping is 2-3 days. Free shipping on orders over $50!' },
              { q: "Can I return them if they don't fit?", a: "Yes! We offer hassle-free 30-day returns. If you're not completely satisfied, we'll give you a full refund — no questions asked." },
              { q: 'How do I wash them?', a: 'Machine wash cold with like colors, tumble dry low. Avoid fabric softeners to maintain the stretch and compression properties.' }
            ].map((faq, idx) => (
              <details key={idx} className="group bg-white rounded-2xl overflow-hidden">
                <summary className="p-6 cursor-pointer font-semibold text-[#4A3540] flex justify-between items-center hover:bg-white/70 transition-colors">
                  {faq.q}
                  <span className="text-[#E8A0B5] group-open:rotate-45 transition-transform text-2xl">+</span>
                </summary>
                <div className="px-6 pb-6 text-[#4A3540]/70">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Inclusive Fit Section */}
      <section id="inclusive-fit" className="relative py-0">
        <div className="relative w-full">
          <img
            src="/features/inclusive-fit.webp"
            alt="Inclusive Fit - XS to 2XL"
            className="w-full h-auto"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#4A3540]/80 via-[#4A3540]/20 to-transparent flex items-end justify-center pb-12 lg:pb-20">
            <div className="text-center text-white px-4">
              <h2 className="font-['Fraunces'] text-2xl lg:text-4xl font-bold mb-3">
                Made for Every Body
              </h2>
              <p className="text-white/90 text-base lg:text-lg max-w-xl mx-auto">
                Sizes XS to 2XL. Because confidence looks good on everyone.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section id="cta" className="py-16 lg:py-24 px-4 bg-gradient-to-br from-[#E8A0B5] to-[#B8D4E8]">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-['Fraunces'] text-3xl lg:text-5xl font-bold text-white mb-6">
            Ready to Feel Confident?
          </h2>
          <p className="text-white/90 text-lg mb-8">
            Join 50,000+ women who upgraded their leggings game. Starting at just $19.99.
          </p>
          <button
            onClick={handleAddToCart}
            className="bg-white text-[#4A3540] px-12 py-3 sm:py-5 rounded-xl sm:rounded-2xl font-bold text-base sm:text-lg hover:bg-[#FDF5F7] transition-all transform hover:scale-105 shadow-xl"
          >
            SHOP NOW - FROM $19.99
          </button>
          <p className="text-white/70 text-sm mt-4">
            🔒 Secure checkout • Free shipping $50+ • 30-day returns
          </p>
        </div>
      </section>

      {/* Sticky Mobile CTA */}
      <div className={`fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-2xl lg:hidden transition-transform duration-300 ${showSticky ? 'translate-y-0' : 'translate-y-full'}`}>
        <button
          onClick={handleAddToCart}
          className="w-full bg-[#E8A0B5] text-white py-4 rounded-xl font-bold text-lg"
        >
          ADD TO CART - ${selectedBundle.price}
        </button>
      </div>

      {/* Size Guide Modal */}
      {showSizeGuide && (
        <div
          className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setShowSizeGuide(false)}
        >
          <div
            className="bg-white rounded-3xl max-w-md w-full max-h-[90vh] overflow-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">📏</span>
                  <h3 className="font-['Fraunces'] text-xl font-bold text-[#4A3540]">Size Guide</h3>
                </div>
                <button
                  onClick={() => setShowSizeGuide(false)}
                  className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                >
                  <span className="text-[#4A3540] text-lg">×</span>
                </button>
              </div>
            </div>
            <div className="p-6">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-[#4A3540]/60 text-left">
                    <th className="pb-3 font-medium">Size</th>
                    <th className="pb-3 font-medium">Dress</th>
                    <th className="pb-3 font-medium">Waist</th>
                    <th className="pb-3 font-medium">Hip</th>
                  </tr>
                </thead>
                <tbody>
                  {SIZE_GUIDE_DATA.map((row) => (
                    <tr
                      key={row.size}
                      className={`border-t border-gray-100 ${selectedSize === row.size ? 'bg-[#E8A0B5]/10' : ''}`}
                    >
                      <td className={`py-3 font-semibold ${selectedSize === row.size ? 'text-[#E8A0B5]' : 'text-[#4A3540]'}`}>
                        {row.size}
                      </td>
                      <td className="py-3 text-[#4A3540]/70">{row.dress}</td>
                      <td className="py-3 text-[#4A3540]/70">{row.waist}</td>
                      <td className="py-3 text-[#4A3540]/70">{row.hip}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="mt-6 p-4 bg-[#B8D4E8]/20 rounded-xl">
                <p className="text-sm text-[#4A3540]">
                  <span className="font-semibold">Pro tip:</span> Between sizes? Size up for a comfy fit, size down for more compression.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Video Modal */}
      {activeVideo && (
        <div
          className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4"
          onClick={() => setActiveVideo(null)}
        >
          <button
            onClick={() => setActiveVideo(null)}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center z-10"
          >
            <span className="text-white text-2xl">×</span>
          </button>
          <div
            className="relative max-w-sm w-full aspect-[9/16] rounded-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <video
              src={activeVideo}
              className="w-full h-full object-cover"
              controls
              autoPlay
              playsInline
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default App
