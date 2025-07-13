import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertBusinessSchema, insertServiceSchema, insertStaffSchema } from "@shared/schema";
import { z } from "zod";
import { Loader2, CheckCircle, Stethoscope, Scissors, Sparkles, Dumbbell, GraduationCap, Briefcase, Home, Heart } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const businessSchema = insertBusinessSchema.extend({
  industry: z.string().min(1, "Please select an industry"),
});

type BusinessForm = z.infer<typeof businessSchema>;

const industries = [
  { value: "healthcare", label: "Healthcare", icon: Stethoscope, desc: "Doctors, Clinics, Medical practices" },
  { value: "beauty", label: "Beauty & Hair", icon: Scissors, desc: "Salons, Barbers, Beauty services" },
  { value: "wellness", label: "Wellness & Spa", icon: Sparkles, desc: "Spas, Massage, Therapy" },
  { value: "fitness", label: "Fitness", icon: Dumbbell, desc: "Gyms, Personal training, Classes" },
  { value: "education", label: "Education", icon: GraduationCap, desc: "Tutoring, Coaching, Lessons" },
  { value: "professional", label: "Professional Services", icon: Briefcase, desc: "Consulting, Legal, Financial" },
  { value: "home", label: "Home Services", icon: Home, desc: "Cleaning, Repair, Maintenance" },
  { value: "other", label: "Other", icon: Heart, desc: "Any appointment-based business" },
];

const serviceTemplates = {
  healthcare: [
    { name: "Consultation", duration: 30, price: "150" },
    { name: "Follow-up Visit", duration: 15, price: "75" },
    { name: "Physical Exam", duration: 45, price: "200" },
  ],
  beauty: [
    { name: "Haircut", duration: 60, price: "50" },
    { name: "Hair Color", duration: 120, price: "120" },
    { name: "Manicure", duration: 45, price: "35" },
  ],
  wellness: [
    { name: "Swedish Massage", duration: 60, price: "90" },
    { name: "Deep Tissue Massage", duration: 90, price: "130" },
    { name: "Facial Treatment", duration: 75, price: "85" },
  ],
  fitness: [
    { name: "Personal Training", duration: 60, price: "80" },
    { name: "Group Class", duration: 45, price: "25" },
    { name: "Fitness Assessment", duration: 30, price: "50" },
  ],
  education: [
    { name: "1-on-1 Tutoring", duration: 60, price: "60" },
    { name: "Group Lesson", duration: 90, price: "40" },
    { name: "Assessment", duration: 30, price: "30" },
  ],
  professional: [
    { name: "Consultation", duration: 60, price: "200" },
    { name: "Strategy Session", duration: 90, price: "300" },
    { name: "Review Meeting", duration: 30, price: "100" },
  ],
  home: [
    { name: "House Cleaning", duration: 120, price: "120" },
    { name: "Maintenance Visit", duration: 60, price: "80" },
    { name: "Consultation", duration: 30, price: "50" },
  ],
  other: [
    { name: "Service 1", duration: 60, price: "75" },
    { name: "Service 2", duration: 30, price: "50" },
  ],
};

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const [selectedIndustry, setSelectedIndustry] = useState<string>("");
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();

  const businessForm = useForm<BusinessForm>({
    resolver: zodResolver(businessSchema),
    defaultValues: {
      name: "",
      industry: "",
      description: "",
      email: "",
      phone: "",
      address: "",
      website: "",
      timezone: "UTC",
    },
  });

  const createBusinessMutation = useMutation({
    mutationFn: async (data: BusinessForm) => {
      const res = await apiRequest("POST", "/api/business", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/business"] });
      setStep(2);
    },
    onError: (error) => {
      toast({
        title: "Error creating business",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const createServiceMutation = useMutation({
    mutationFn: async (services: Array<{ name: string; duration: number; price: string; description?: string }>) => {
      const results = await Promise.all(
        services.map(service => 
          apiRequest("POST", "/api/services", service).then(res => res.json())
        )
      );
      return results;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/services"] });
      setStep(3);
    },
    onError: (error) => {
      toast({
        title: "Error creating services",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const createStaffMutation = useMutation({
    mutationFn: async (staff: { name: string; email: string; phone?: string }) => {
      const res = await apiRequest("POST", "/api/staff", staff);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/staff"] });
      toast({
        title: "Setup complete!",
        description: "Your business is ready to start accepting bookings.",
      });
      setLocation("/dashboard");
    },
    onError: (error) => {
      toast({
        title: "Error creating staff member",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onBusinessSubmit = (data: BusinessForm) => {
    createBusinessMutation.mutate(data);
  };

  const handleServiceSetup = () => {
    if (!selectedIndustry) return;
    
    const templates = serviceTemplates[selectedIndustry as keyof typeof serviceTemplates] || [];
    createServiceMutation.mutate(templates);
  };

  const handleStaffSetup = (data: { name: string; email: string; phone?: string }) => {
    createStaffMutation.mutate(data);
  };

  if (!user) {
    setLocation("/auth");
    return <div>Redirecting...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-primary text-white p-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold">Welcome to BookFlow</h1>
          <p className="text-blue-100">Let's set up your business in just a few steps</p>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="bg-muted/50 border-b border-border">
        <div className="max-w-4xl mx-auto p-6">
          <div className="flex items-center justify-between">
            {[
              { step: 1, title: "Business Info", completed: step > 1 },
              { step: 2, title: "Services", completed: step > 2 },
              { step: 3, title: "Staff Setup", completed: step > 3 },
            ].map((item, i) => (
              <div key={i} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                  item.completed 
                    ? "bg-accent text-white" 
                    : step === item.step 
                      ? "bg-primary text-white" 
                      : "bg-muted text-muted-foreground"
                }`}>
                  {item.completed ? <CheckCircle className="h-4 w-4" /> : item.step}
                </div>
                <span className={`ml-2 font-medium ${
                  step === item.step ? "text-foreground" : "text-muted-foreground"
                }`}>
                  {item.title}
                </span>
                {i < 2 && <div className="w-16 h-px bg-border mx-4" />}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Tell us about your business</CardTitle>
              <CardDescription>
                This information helps us customize BookFlow for your specific industry and needs.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={businessForm.handleSubmit(onBusinessSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Business Name *</Label>
                    <Input
                      id="name"
                      {...businessForm.register("name")}
                      disabled={createBusinessMutation.isPending}
                    />
                    {businessForm.formState.errors.name && (
                      <p className="text-sm text-destructive">
                        {businessForm.formState.errors.name.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="industry">Industry *</Label>
                    <Select 
                      onValueChange={(value) => {
                        businessForm.setValue("industry", value);
                        setSelectedIndustry(value);
                      }}
                      disabled={createBusinessMutation.isPending}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select your industry" />
                      </SelectTrigger>
                      <SelectContent>
                        {industries.map((industry) => (
                          <SelectItem key={industry.value} value={industry.value}>
                            <div className="flex items-center space-x-2">
                              <industry.icon className="h-4 w-4" />
                              <span>{industry.label}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {businessForm.formState.errors.industry && (
                      <p className="text-sm text-destructive">
                        {businessForm.formState.errors.industry.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Business Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      {...businessForm.register("email")}
                      disabled={createBusinessMutation.isPending}
                    />
                    {businessForm.formState.errors.email && (
                      <p className="text-sm text-destructive">
                        {businessForm.formState.errors.email.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      {...businessForm.register("phone")}
                      disabled={createBusinessMutation.isPending}
                    />
                    {businessForm.formState.errors.phone && (
                      <p className="text-sm text-destructive">
                        {businessForm.formState.errors.phone.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Business Description</Label>
                  <Textarea
                    id="description"
                    {...businessForm.register("description")}
                    placeholder="Tell us about your business..."
                    disabled={createBusinessMutation.isPending}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    {...businessForm.register("address")}
                    placeholder="Your business address"
                    disabled={createBusinessMutation.isPending}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    {...businessForm.register("website")}
                    placeholder="https://yourwebsite.com"
                    disabled={createBusinessMutation.isPending}
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={createBusinessMutation.isPending}
                >
                  {createBusinessMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Continue to Services
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>Set up your services</CardTitle>
              <CardDescription>
                We've pre-configured some common services for your industry. You can customize these later.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {selectedIndustry && (
                  <div>
                    <h3 className="font-semibold mb-4">Recommended services for {industries.find(i => i.value === selectedIndustry)?.label}:</h3>
                    <div className="space-y-3">
                      {serviceTemplates[selectedIndustry as keyof typeof serviceTemplates]?.map((service, i) => (
                        <div key={i} className="p-4 border border-border rounded-lg">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium">{service.name}</h4>
                              <p className="text-sm text-muted-foreground">
                                Duration: {service.duration} minutes
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold">${service.price}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex space-x-4">
                  <Button 
                    onClick={handleServiceSetup}
                    disabled={createServiceMutation.isPending}
                  >
                    {createServiceMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Use These Services
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setStep(3)}
                  >
                    Skip for Now
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 3 && (
          <Card>
            <CardHeader>
              <CardTitle>Add yourself as a staff member</CardTitle>
              <CardDescription>
                This allows customers to book appointments with you specifically.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                handleStaffSetup({
                  name: formData.get("name") as string,
                  email: formData.get("email") as string,
                  phone: formData.get("phone") as string || undefined,
                });
              }} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="staff-name">Your Name *</Label>
                  <Input
                    id="staff-name"
                    name="name"
                    defaultValue={user.username}
                    required
                    disabled={createStaffMutation.isPending}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="staff-email">Your Email *</Label>
                  <Input
                    id="staff-email"
                    name="email"
                    type="email"
                    defaultValue={user.email}
                    required
                    disabled={createStaffMutation.isPending}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="staff-phone">Your Phone</Label>
                  <Input
                    id="staff-phone"
                    name="phone"
                    disabled={createStaffMutation.isPending}
                  />
                </div>

                <div className="flex space-x-4">
                  <Button 
                    type="submit"
                    disabled={createStaffMutation.isPending}
                  >
                    {createStaffMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Complete Setup
                  </Button>
                  <Button 
                    type="button"
                    variant="outline" 
                    onClick={() => setLocation("/dashboard")}
                  >
                    Skip for Now
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
