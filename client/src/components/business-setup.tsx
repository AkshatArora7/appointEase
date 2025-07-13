import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
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

interface BusinessSetupProps {
  onComplete: () => void;
}

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
    { name: "Consultation", duration: 30, price: "150", description: "Initial consultation with doctor" },
    { name: "Follow-up Visit", duration: 15, price: "75", description: "Follow-up appointment" },
    { name: "Physical Exam", duration: 45, price: "200", description: "Comprehensive physical examination" },
  ],
  beauty: [
    { name: "Haircut", duration: 60, price: "50", description: "Professional haircut and styling" },
    { name: "Hair Color", duration: 120, price: "120", description: "Full hair coloring service" },
    { name: "Manicure", duration: 45, price: "35", description: "Professional nail care" },
  ],
  wellness: [
    { name: "Swedish Massage", duration: 60, price: "90", description: "Relaxing full body massage" },
    { name: "Deep Tissue Massage", duration: 90, price: "130", description: "Therapeutic deep tissue work" },
    { name: "Facial Treatment", duration: 75, price: "85", description: "Rejuvenating facial treatment" },
  ],
  fitness: [
    { name: "Personal Training", duration: 60, price: "80", description: "One-on-one fitness training" },
    { name: "Group Class", duration: 45, price: "25", description: "Group fitness class" },
    { name: "Fitness Assessment", duration: 30, price: "50", description: "Initial fitness evaluation" },
  ],
  education: [
    { name: "1-on-1 Tutoring", duration: 60, price: "60", description: "Individual tutoring session" },
    { name: "Group Lesson", duration: 90, price: "40", description: "Small group instruction" },
    { name: "Assessment", duration: 30, price: "30", description: "Skills assessment" },
  ],
  professional: [
    { name: "Consultation", duration: 60, price: "200", description: "Professional consultation" },
    { name: "Strategy Session", duration: 90, price: "300", description: "Strategic planning session" },
    { name: "Review Meeting", duration: 30, price: "100", description: "Progress review meeting" },
  ],
  home: [
    { name: "House Cleaning", duration: 120, price: "120", description: "Complete house cleaning service" },
    { name: "Maintenance Visit", duration: 60, price: "80", description: "Home maintenance check" },
    { name: "Consultation", duration: 30, price: "50", description: "Service consultation" },
  ],
  other: [
    { name: "Service 1", duration: 60, price: "75", description: "Primary service offering" },
    { name: "Service 2", duration: 30, price: "50", description: "Secondary service offering" },
  ],
};

export default function BusinessSetup({ onComplete }: BusinessSetupProps) {
  const [step, setStep] = useState(1);
  const [selectedIndustry, setSelectedIndustry] = useState<string>("");
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
      onComplete();
    },
    onError: (error) => {
      toast({
        title: "Error creating services",
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

  const skipServices = () => {
    onComplete();
  };

  return (
    <div className="space-y-6">
      {/* Progress Steps */}
      <div className="flex items-center justify-center space-x-8">
        {[
          { step: 1, title: "Business Info", completed: step > 1 },
          { step: 2, title: "Services", completed: step > 2 },
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
            {i < 1 && <div className="w-16 h-px bg-border mx-4" />}
          </div>
        ))}
      </div>

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
                            {service.description && (
                              <p className="text-sm text-muted-foreground mt-1">
                                {service.description}
                              </p>
                            )}
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
                  onClick={skipServices}
                >
                  Skip for Now
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
