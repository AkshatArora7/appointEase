import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, 
  Bell, 
  Users, 
  BarChart3, 
  Smartphone, 
  Link,
  Stethoscope,
  Scissors,
  Sparkles,
  Dumbbell,
  GraduationCap,
  Briefcase,
  Home,
  Heart,
  CheckCircle,
  Star
} from "lucide-react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";

export default function LandingPage() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();

  const handleGetStarted = () => {
    if (user) {
      setLocation("/dashboard");
    } else {
      setLocation("/auth");
    }
  };

  const industries = [
    { icon: Stethoscope, name: "Healthcare", desc: "Doctors, Clinics, Specialists", color: "text-blue-600" },
    { icon: Scissors, name: "Beauty & Hair", desc: "Salons, Barbers, Stylists", color: "text-green-600" },
    { icon: Sparkles, name: "Wellness & Spa", desc: "Spas, Massage, Therapy", color: "text-purple-600" },
    { icon: Dumbbell, name: "Fitness", desc: "Gyms, Trainers, Classes", color: "text-orange-600" },
    { icon: GraduationCap, name: "Education", desc: "Tutors, Coaches, Lessons", color: "text-indigo-600" },
    { icon: Briefcase, name: "Professional", desc: "Consultants, Lawyers, Advisors", color: "text-red-600" },
    { icon: Home, name: "Home Services", desc: "Cleaning, Repair, Maintenance", color: "text-teal-600" },
    { icon: Heart, name: "And More", desc: "Any appointment-based business", color: "text-pink-600" },
  ];

  const features = [
    { icon: Calendar, title: "Smart Scheduling", desc: "Intelligent calendar management with availability optimization and conflict prevention." },
    { icon: Bell, title: "Auto Notifications", desc: "Automated email and SMS reminders to reduce no-shows and keep clients informed." },
    { icon: Users, title: "Staff Management", desc: "Manage multiple staff members, their schedules, and service assignments effortlessly." },
    { icon: BarChart3, title: "Business Analytics", desc: "Detailed insights into your booking patterns, revenue, and business performance." },
    { icon: Smartphone, title: "Mobile Optimized", desc: "Perfect experience on all devices with responsive design and mobile-first approach." },
    { icon: Link, title: "Booking Links", desc: "Share simple booking links on your website, social media, or business cards." },
  ];

  const pricingPlans = [
    {
      name: "Starter",
      price: "$29",
      period: "/month",
      description: "Perfect for solo practitioners",
      features: [
        "Up to 100 appointments/month",
        "1 staff member",
        "Email notifications",
        "Basic analytics",
        "Mobile app access"
      ],
      buttonText: "Start Free Trial",
      popular: false
    },
    {
      name: "Professional",
      price: "$79",
      period: "/month",
      description: "Great for growing businesses",
      features: [
        "Unlimited appointments",
        "Up to 5 staff members",
        "Email & SMS notifications",
        "Advanced analytics",
        "Custom booking forms",
        "Priority support"
      ],
      buttonText: "Start Free Trial",
      popular: true
    },
    {
      name: "Enterprise",
      price: "$199",
      period: "/month",
      description: "For large organizations",
      features: [
        "Unlimited everything",
        "Unlimited staff members",
        "Multiple locations",
        "API access",
        "White-label solution",
        "Dedicated support"
      ],
      buttonText: "Contact Sales",
      popular: false
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="bg-white border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex-shrink-0 flex items-center">
              <div className="text-2xl font-bold text-primary">BookFlow</div>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-8">
                <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">Features</a>
                <a href="#industries" className="text-muted-foreground hover:text-foreground transition-colors">Industries</a>
                <a href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {user ? (
                <Button onClick={() => setLocation("/dashboard")}>
                  Go to Dashboard
                </Button>
              ) : (
                <>
                  <Button variant="ghost" onClick={() => setLocation("/auth")}>
                    Sign In
                  </Button>
                  <Button onClick={handleGetStarted}>
                    Start Free Trial
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
              Universal Appointment<br />
              <span className="text-primary">Booking Made Simple</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              One powerful platform for every industry. Doctors, barbers, salons, spas, and more. 
              Streamline your bookings with our professional appointment management system.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button size="lg" onClick={handleGetStarted}>
                Start Your Free Trial
              </Button>
              <Button variant="outline" size="lg">
                View Demo
              </Button>
            </div>

            {/* Dashboard Preview */}
            <div className="mt-12">
              <Card className="max-w-4xl mx-auto shadow-2xl">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    </div>
                    <div className="text-sm text-muted-foreground">BookFlow Dashboard</div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="col-span-2">
                      <div className="bg-muted rounded-lg p-4">
                        <h3 className="font-semibold mb-3">Today's Appointments</h3>
                        <div className="space-y-3">
                          {[
                            { name: "Sarah Johnson", service: "Hair Cut & Style", time: "10:00 AM" },
                            { name: "Michael Chen", service: "Consultation", time: "2:30 PM" },
                            { name: "Emma Wilson", service: "Massage Therapy", time: "4:00 PM" }
                          ].map((appointment, i) => (
                            <div key={i} className="bg-background rounded-lg p-3 flex items-center justify-between">
                              <div>
                                <div className="font-medium">{appointment.name}</div>
                                <div className="text-sm text-muted-foreground">{appointment.service}</div>
                              </div>
                              <div className="text-primary font-semibold">{appointment.time}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="bg-accent/10 rounded-lg p-4">
                        <div className="text-2xl font-bold text-accent">12</div>
                        <div className="text-sm text-muted-foreground">Appointments Today</div>
                      </div>
                      <div className="bg-primary/10 rounded-lg p-4">
                        <div className="text-2xl font-bold text-primary">94%</div>
                        <div className="text-sm text-muted-foreground">Booking Rate</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Industries Section */}
      <section id="industries" className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">Built for Every Industry</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              From healthcare to beauty, our platform adapts to your business needs with industry-specific features.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {industries.map((industry, i) => (
              <div key={i} className="text-center group">
                <div className="bg-muted w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-muted/80 transition-colors">
                  <industry.icon className={`text-2xl ${industry.color}`} />
                </div>
                <h3 className="font-semibold text-foreground">{industry.name}</h3>
                <p className="text-sm text-muted-foreground mt-1">{industry.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-muted/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">Everything You Need to Manage Appointments</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Powerful features designed to streamline your booking process and grow your business.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <Card key={i} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                    <feature.icon className="text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">Simple, Transparent Pricing</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Choose the perfect plan for your business. All plans include core features with no hidden fees.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {pricingPlans.map((plan, i) => (
              <Card key={i} className={`${plan.popular ? 'border-2 border-primary shadow-lg' : ''} relative`}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground">Most Popular</Badge>
                  </div>
                )}
                <CardContent className="p-8">
                  <div className="text-center">
                    <h3 className="text-2xl font-bold text-foreground mb-2">{plan.name}</h3>
                    <div className="text-4xl font-bold text-primary mb-4">
                      {plan.price}
                      <span className="text-lg text-muted-foreground">{plan.period}</span>
                    </div>
                    <p className="text-muted-foreground mb-6">{plan.description}</p>
                  </div>
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, j) => (
                      <li key={j} className="flex items-center">
                        <CheckCircle className="text-accent mr-3 h-4 w-4" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button 
                    className="w-full" 
                    variant={plan.popular ? "default" : "outline"}
                    onClick={handleGetStarted}
                  >
                    {plan.buttonText}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary to-blue-700">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Transform Your Booking Process?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of businesses that have streamlined their appointment management with BookFlow. 
            Start your free trial today - no credit card required.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button size="lg" variant="secondary" onClick={handleGetStarted}>
              Start Your Free Trial
            </Button>
            <Button size="lg" variant="outline" className="text-white border-white hover:bg-white hover:text-primary bg-transparent">
              Schedule a Demo
            </Button>
          </div>
          <p className="text-blue-200 text-sm mt-4">14-day free trial • No setup fees • Cancel anytime</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background border-t border-border py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="text-2xl font-bold text-primary mb-4">BookFlow</div>
              <p className="text-muted-foreground max-w-md">
                The universal appointment booking platform trusted by businesses across all industries. 
                Streamline your scheduling and grow your business.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Product</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#features" className="hover:text-foreground transition-colors">Features</a></li>
                <li><a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a></li>
                <li><a href="#industries" className="hover:text-foreground transition-colors">Industries</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Support</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center">
            <p className="text-muted-foreground">© 2024 BookFlow. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
