"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import gsap from "gsap";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "framer-motion";

// Event data structure
interface EventOutcome {
  label: string;
  probability: number;
  change: number;
}

interface PredictionEvent {
  id: number;
  category: string;
  categoryEmoji: string;
  title: string;
  outcomes: EventOutcome[];
  moreOutcomes?: number;
  traders: number;
  volume: string;
}

// All events in the stack
const eventsData: PredictionEvent[] = [
  {
    id: 1,
    category: "Campus Climate",
    categoryEmoji: "🏛️",
    title: "What will Shipman say in her next email?",
    outcomes: [
      { label: "Committed", probability: 72, change: 3 },
      { label: "Hamilton", probability: 8, change: -2 },
    ],
    moreOutcomes: 4,
    traders: 847,
    volume: "$4,230",
  },
  {
    id: 2,
    category: "Academics",
    categoryEmoji: "📚",
    title: "What will the mean for the Data Structures Midterm be?",
    outcomes: [
      { label: "60-70", probability: 45, change: 8 },
      { label: "≥80", probability: 22, change: -4 },
    ],
    moreOutcomes: 2,
    traders: 1243,
    volume: "$8,120",
  },
  {
    id: 3,
    category: "Events",
    categoryEmoji: "🎭",
    title: "When will Varsity Show tickets sell out by?",
    outcomes: [
      { label: "Tomorrow", probability: 58, change: 12 },
      { label: "2 days", probability: 31, change: -5 },
    ],
    traders: 562,
    volume: "$2,890",
  },
  {
    id: 4,
    category: "Campus Life",
    categoryEmoji: "🐀",
    title: "First dorm to have a rat this semester?",
    outcomes: [
      { label: "McBain", probability: 34, change: 6 },
      { label: "Carmen", probability: 28, change: -3 },
    ],
    moreOutcomes: 28,
    traders: 923,
    volume: "$5,670",
  },
  {
    id: 5,
    category: "Bacchanal",
    categoryEmoji: "🎤",
    title: "Who will the Bacchanal headliner be?",
    outcomes: [
      { label: "Childish Gambino", probability: 18, change: 4 },
      { label: "Rich the Kid", probability: 12, change: -1 },
    ],
    moreOutcomes: 8,
    traders: 2156,
    volume: "$15,420",
  },
];

// Sparkline paths - dramatically different variations for visual variety
const sparklinePaths = {
  up: [
    "M0,42 L25,40 L50,36 L75,30 L100,22 L125,14 L150,8",
    "M0,38 L15,28 L30,42 L45,22 L60,38 L75,18 L90,32 L105,12 L120,24 L135,8 L150,10",
    "M0,44 L30,42 L60,38 L90,28 L120,16 L150,6",
    "M0,40 L20,40 L20,32 L50,32 L50,24 L80,24 L80,16 L110,16 L110,10 L150,10",
    "M0,42 L40,44 L60,42 L80,40 L100,32 L120,18 L150,6",
  ],
  down: [
    "M0,8 L25,12 L50,18 L75,26 L100,34 L125,40 L150,44",
    "M0,10 L15,22 L30,8 L45,24 L60,14 L75,30 L90,20 L105,36 L120,28 L135,42 L150,40",
    "M0,6 L30,10 L60,18 L90,28 L120,38 L150,46",
    "M0,10 L20,10 L20,18 L50,18 L50,26 L80,26 L80,34 L110,34 L110,42 L150,42",
    "M0,8 L40,6 L60,10 L80,12 L100,22 L120,36 L150,46",
  ],
};

// Mock sparkline data for trading visualization
const SparklineChart = ({ trend, color, variant = 0 }: { trend: "up" | "down"; color: string; variant?: number }) => {
  const paths = sparklinePaths[trend];
  const pathIndex = variant % paths.length;
  const path = paths[pathIndex];
  const endY = path.split(" ").pop()?.split(",")[1];
  
  return (
    <svg width="100" height="36" viewBox="0 0 150 50" className="overflow-visible">
      <defs>
        <linearGradient id={`gradient-${trend}-${variant}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="sparkline-animate"
      />
      <circle
        cx="150"
        cy={endY || (trend === "up" ? "8" : "40")}
        r="4"
        fill={color}
        className="live-pulse"
      />
    </svg>
  );
};

// Toast notification component
const Toast = ({ message, isVisible, onClose }: { message: string; isVisible: boolean; onClose: () => void }) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(onClose, 4000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 bg-slate-900 text-white text-sm font-medium rounded-xl shadow-2xl flex items-center gap-3"
        >
          <svg className="w-5 h-5 text-amber-400 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// 3D Tilt Card wrapper component
const TiltCard = ({ children, className }: { children: React.ReactNode; className?: string }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 30 });
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 30 });
  
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["4deg", "-4deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-4deg", "4deg"]);
  
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };
  
  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };
  
  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export default function Home() {
  const [email, setEmail] = useState("");
  const [isScrolled, setIsScrolled] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [waitlistPosition, setWaitlistPosition] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [inputError, setInputError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Trigger entrance animations on mount
  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Check for verification status in URL params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const verified = params.get('verified');
    const message = params.get('message');
    
    if (verified === 'true') {
      if (message === 'success') {
        setToastMessage('Email verified successfully!');
        setShowToast(true);
      } else if (message === 'already_verified') {
        setToastMessage('Your email is already verified.');
        setShowToast(true);
      }
      // Clean up URL
      window.history.replaceState({}, '', window.location.pathname);
    } else if (params.get('error')) {
      const error = params.get('error');
      if (error === 'invalid_token') {
        setToastMessage('Invalid or expired verification link.');
      } else if (error === 'verification_failed') {
        setToastMessage('Verification failed. Please try again.');
      } else {
        setToastMessage('An error occurred. Please try again.');
      }
      setShowToast(true);
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes("@")) {
      setInputError(true);
      inputRef.current?.classList.add("shake");
      setTimeout(() => {
        inputRef.current?.classList.remove("shake");
        setInputError(false);
      }, 600);
      return;
    }
    
    if (!email.toLowerCase().endsWith("@columbia.edu")) {
      setInputError(true);
      inputRef.current?.classList.add("shake");
      setToastMessage("Alpha is currently restricted to @columbia.edu users.");
      setShowToast(true);
      setTimeout(() => {
        inputRef.current?.classList.remove("shake");
        setInputError(false);
      }, 600);
      return;
    }
    
    setIsSubmitting(true);
    setInputError(false);
    
    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to join waitlist');
      }
      
      setWaitlistPosition(data.position);
      setIsSubmitted(true);
      setToastMessage(data.message || 'Successfully joined waitlist!');
      setShowToast(true);
    } catch (error) {
      console.error('Error joining waitlist:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to join waitlist. Please try again.';
      setToastMessage(errorMessage);
      setShowToast(true);
      setInputError(true);
      inputRef.current?.classList.add("shake");
      setTimeout(() => {
        inputRef.current?.classList.remove("shake");
        setInputError(false);
      }, 600);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle scroll for glass navbar effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Get visible cards (current + 2 behind)
  const getVisibleCards = useCallback(() => {
    const visible = [];
    for (let i = 0; i < 3; i++) {
      const idx = (currentIndex + i) % eventsData.length;
      visible.push({ event: eventsData[idx], stackPosition: i });
    }
    return visible;
  }, [currentIndex]);

  // Rotate card to back of stack with vertical drop animation
  const rotateCard = useCallback(() => {
    if (isAnimating) return;
    setIsAnimating(true);

    const frontCard = cardRefs.current[0];
    const card1 = cardRefs.current[1];
    const card2 = cardRefs.current[2];

    if (!frontCard || !card1 || !card2) {
      setIsAnimating(false);
      return;
    }

    const cardHeight = 520;

    const tl = gsap.timeline({
      onComplete: () => {
        setCurrentIndex((prev) => (prev + 1) % eventsData.length);
        setIsAnimating(false);
      },
    });

    tl.to(frontCard, {
      y: cardHeight,
      duration: 0.4,
      ease: "power3.inOut",
    });

    tl.to(frontCard, {
      scale: 0.92,
      x: 16,
      zIndex: 5,
      duration: 0.3,
      ease: "power2.inOut",
    });

    tl.to(
      card1,
      {
        scale: 1,
        x: 0,
        y: 0,
        duration: 0.35,
        ease: "power2.inOut",
      },
      "-=0.3"
    );

    tl.to(
      card2,
      {
        scale: 0.96,
        x: 8,
        y: 14,
        duration: 0.35,
        ease: "power2.inOut",
      },
      "-=0.35"
    );

    tl.to(
      frontCard,
      {
        y: 28,
        duration: 0.4,
        ease: "power3.inOut",
      },
      "-=0.2"
    );
  }, [isAnimating]);

  // Reset card positions when currentIndex changes
  useEffect(() => {
    cardRefs.current.forEach((card, i) => {
      if (card) {
        gsap.set(card, {
          rotateY: 0,
          rotateZ: 0,
          x: i === 0 ? 0 : i === 1 ? 8 : 16,
          y: i === 0 ? 0 : i === 1 ? 14 : 28,
          scale: i === 0 ? 1 : i === 1 ? 0.96 : 0.92,
          opacity: 1,
          zIndex: 10 - i,
        });
      }
    });
  }, [currentIndex]);

  const visibleCards = getVisibleCards();

  return (
    <div className="min-h-screen bg-background grid-pattern hero-gradient overflow-x-hidden">
      {/* Toast Notification */}
      <Toast 
        message={toastMessage} 
        isVisible={showToast} 
        onClose={() => setShowToast(false)} 
      />
      
      {/* Sticky Glass Navbar */}
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : -20 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled ? "glass-nav shadow-md" : "bg-transparent"
        }`}
      >
        <div className="w-full max-w-7xl mx-auto px-6 md:px-12 lg:px-16">
          <div className="flex items-center justify-between h-20">
            {/* Logo with Weight Contrast */}
            <div className="flex items-center gap-3">
              <span className="text-2xl tracking-tight px-4 py-2 rounded-xl bg-primary/8 backdrop-blur-md border border-primary/15 shadow-sm">
                <span className="font-semibold text-primary">CU</span>
                <span className="font-light italic text-primary/80">Andaz</span>
              </span>
            </div>

            {/* Nav CTA Button - Static (no shimmer) */}
            <Button 
              className="h-11 rounded-xl px-6 text-sm font-semibold cta-premium-static text-white"
            >
              Join Now
            </Button>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section - Split Grid Layout */}
      <main className="min-h-screen pt-20">
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-16 min-h-[90vh] grid lg:grid-cols-2 gap-12 lg:gap-20 items-center py-16">
          
          {/* Left Column - Copy */}
          <div className="flex flex-col items-start gap-10 order-2 lg:order-1">
            {/* Predictive Eyebrow */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 20 }}
              transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
              className="flex items-center gap-3"
            >
              <div className="h-px w-10 bg-primary/40" />
              <span className="text-sm font-medium tracking-widest text-muted-foreground uppercase">
                The Columbia Prediction Market
              </span>
            </motion.div>

            {/* Main Headline */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 20 }}
              transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
              className="flex flex-col gap-5"
            >
              <h1 className="text-4xl md:text-5xl lg:text-[3.5rem] font-bold tracking-tight text-foreground leading-[1.08]">
                Trade on Campus Outcomes.
              </h1>
              
              {/* Sub-headline */}
              <p className="text-lg md:text-xl text-muted-foreground max-w-lg leading-relaxed">
                Compete with peers, leverage your alpha, and own the future.
              </p>
            </motion.div>

            {/* Email Capture / Success Dashboard */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 20 }}
              transition={{ duration: 0.7, delay: 0.35, ease: "easeOut" }}
              className="w-full max-w-md"
            >
              <AnimatePresence mode="wait">
                {!isSubmitted ? (
                  <motion.div
                    key="email-form"
                    initial={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20, scale: 0.95 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                      <div className="flex flex-col sm:flex-row gap-3">
                        <Input
                          ref={inputRef}
                          type="email"
                          placeholder="you@columbia.edu"
                          value={email}
                          onChange={(e) => {
                            setEmail(e.target.value);
                            setInputError(false);
                          }}
                          className={`flex-1 h-14 px-5 text-base rounded-xl input-premium font-medium placeholder:font-normal placeholder:text-muted-foreground/50 ${
                            inputError ? "input-error" : ""
                          }`}
                        />
                        <Button 
                          type="submit"
                          size="lg" 
                          disabled={isSubmitting}
                          className="h-14 rounded-xl px-8 text-base font-semibold cta-premium text-white whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isSubmitting ? 'Joining...' : 'Join Waitlist'}
                        </Button>
                      </div>
                      <p className="text-sm text-muted-foreground/60 leading-relaxed">
                        Be the first to trade. Limited early access spots.
                      </p>
                    </form>
                  </motion.div>
                ) : (
                  <motion.div
                    key="success-dashboard"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
                    className="success-enter"
                  >
                    <Card className="overflow-hidden border-0 glass-card">
                      <CardContent className="p-6">
                        {/* Success Header */}
                        <motion.div 
                          className="flex items-center gap-4 mb-6"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.15, duration: 0.3 }}
                        >
                          <div className="w-12 h-12 rounded-full verified-badge flex items-center justify-center">
                            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                          <div>
                            <h3 className="font-bold text-lg text-foreground">You&apos;re on the list.</h3>
                          </div>
                        </motion.div>
                        
                        {/* Waitlist Position */}
                        {waitlistPosition !== null && (
                          <motion.div 
                            className="mb-5"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.35, duration: 0.3 }}
                          >
                            <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-50/80 border border-slate-200/60">
                              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              </div>
                              <div className="flex-1">
                                <p className="text-sm font-semibold text-foreground">Your waitlist position</p>
                                <p className="text-2xl font-bold text-primary mono-numbers">#{waitlistPosition}</p>
                              </div>
                            </div>
                          </motion.div>
                        )}
                        
                        {/* Verification Message */}
                        <motion.div 
                          className="mt-4"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.5, duration: 0.3 }}
                        >
                          <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50/80 border border-amber-200/60">
                            <svg className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            <div>
                              <p className="text-sm font-semibold text-amber-900 mb-1">Check your email</p>
                              <p className="text-sm text-amber-800/90">
                                We&apos;ve sent a verification link to <span className="font-medium">{email}</span>. Please verify your email to complete your signup.
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>

          {/* Right Column - Card Stack */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: isLoaded ? 1 : 0, scale: isLoaded ? 1 : 0.95 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
            className="flex items-center justify-center order-1 lg:order-2"
          >
            <div ref={containerRef} className="card-stack w-full max-w-md h-[500px] relative">
              {/* Stacked card outlines behind */}
              {visibleCards.slice().reverse().map((item, reverseIdx) => {
                const idx = 2 - reverseIdx;
                return (
                  <div
                    key={`${item.event.id}-${idx}`}
                    ref={(el) => { cardRefs.current[idx] = el; }}
                    className={`absolute inset-0 ${idx === 0 ? 'active-card' : ''}`}
                    style={{
                      zIndex: 10 - idx,
                    }}
                  >
                    <TiltCard className="w-full h-full">
                      <Card className="glass-card w-full h-full rounded-2xl overflow-hidden border-0">
                        <CardContent className="p-0 h-full flex flex-col">
                          {/* Card Header */}
                          <div className="flex items-center justify-between px-6 pt-6 pb-4">
                            <Badge 
                              variant="secondary" 
                              className="bg-columbia/25 text-foreground/80 border border-columbia-dark/20 font-medium text-xs"
                            >
                              {item.event.categoryEmoji} {item.event.category}
                            </Badge>
                          </div>

                          {/* Card Title - Playfair Bold */}
                          <div className="px-6 pb-6 shrink-0">
                            <h3 className="font-serif text-2xl md:text-[1.6rem] font-bold text-foreground leading-tight">
                              {item.event.title}
                            </h3>
                          </div>

                          {/* Divider */}
                          <div className="h-px bg-linear-to-r from-transparent via-border to-transparent mx-6" />

                          {/* Trading UI */}
                          <div className="p-6 space-y-3.5 flex-1">
                            {item.event.outcomes.map((outcome, outcomeIdx) => {
                              const isPositive = outcome.change >= 0;
                              const bgColor = outcomeIdx === 0 ? "bg-emerald-50/60 border-emerald-200/40 hover:bg-emerald-50" : "bg-slate-50/60 border-slate-200/40 hover:bg-slate-100/60";
                              const textColor = outcomeIdx === 0 ? "text-emerald-700" : "text-slate-600";
                              const subTextColor = outcomeIdx === 0 ? "text-emerald-600/70" : "text-slate-500";
                              const sparkColor = outcomeIdx === 0 ? "#10b981" : "#64748b";
                              
                              return (
                                <button
                                  key={outcome.label}
                                  onClick={() => idx === 0 && rotateCard()}
                                  disabled={idx !== 0 || isAnimating}
                                  className={`outcome-btn w-full flex items-center justify-between p-4 rounded-xl ${bgColor} border transition-colors cursor-pointer disabled:cursor-default`}
                                >
                                  <div className="flex flex-col gap-0.5 items-start">
                                    <span className="text-sm font-semibold text-foreground">{outcome.label}</span>
                                    <span className={`text-xs ${subTextColor}`}>{outcome.probability}% chance</span>
                                  </div>
                                  <div className="flex items-center gap-4">
                                    <SparklineChart trend={isPositive ? "up" : "down"} color={sparkColor} variant={item.event.id * 2 + outcomeIdx} />
                                    <div className="flex flex-col items-end">
                                      <span className={`mono-numbers text-lg font-bold ${textColor}`}>{outcome.probability}¢</span>
                                      <span className={`mono-numbers text-xs ${isPositive ? 'text-emerald-600/80' : 'text-rose-500'} flex items-center gap-0.5`}>
                                        {isPositive ? (
                                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                                          </svg>
                                        ) : (
                                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                                          </svg>
                                        )}
                                        {isPositive ? '+' : ''}{outcome.change}¢
                                      </span>
                                    </div>
                                  </div>
                                </button>
                              );
                            })}

                            {/* More outcomes indicator */}
                            {item.event.moreOutcomes && (
                              <div className="flex items-center justify-center py-1">
                                <span className="text-xs text-muted-foreground/60 hover:text-muted-foreground cursor-pointer transition-colors">
                                  +{item.event.moreOutcomes} more outcomes
                                </span>
                              </div>
                            )}

                            {/* Volume Info */}
                            <div className="flex items-center justify-between pt-3 text-xs text-muted-foreground/70 border-t border-slate-100">
                              <div className="flex items-center gap-2">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                                <span className="mono-numbers">{item.event.traders.toLocaleString()} traders</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className="mono-numbers">{item.event.volume} vol</span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </TiltCard>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </main>

      {/* Professional Footer with Disclaimer */}
      <footer className="footer-gradient py-16 mt-auto">
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-16">
          {/* Important Disclaimer */}
          <div className="disclaimer-box rounded-2xl p-6 mb-10">
            <div className="flex items-start gap-4">
              <div className="shrink-0 w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-amber-900 mb-1.5">Important Notice</h4>
                <p className="text-sm text-amber-800/90 leading-relaxed">
                  <strong>CUAndaz does not involve real money.</strong> All trading on this platform uses virtual currency with no monetary value. 
                  This is a prediction game for entertainment and educational purposes only. No real financial transactions occur, 
                  and virtual tokens cannot be exchanged for real currency or prizes.
                </p>
              </div>
            </div>
          </div>

          
          {/* Bottom Bar */}
          <div className="pt-8 border-t border-slate-200/60 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-muted-foreground/70">
              © {new Date().getFullYear()} CUAndaz. Not affiliated with Columbia University. For entertainment only.
            </p>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100/80 border border-slate-200/60">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-xs font-medium text-muted-foreground">Virtual Currency Only</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
