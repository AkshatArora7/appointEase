import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  Calendar, 
  Plus, 
  Users, 
  Settings, 
  BarChart3,
  Clock,
  Share2,
  UserPlus,
  CalendarPlus,
  Loader2,
  Copy,
  Check,
  Pencil,
  Trash2,
  TrendingUp,
  DollarSign,
  Mail,
  Phone
} from "lucide-react";
import { format, addDays } from "date-fns";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Business, Appointment, Service, Staff, Customer } from "@shared/schema";

const appointmentSchema = z.object({
  customerName: z.string().min(1, "Customer name is required"),
  customerEmail: z.string().email("Valid email is required").optional().or(z.literal("")),
  customerPhone: z.string().min(1, "Phone number is required"),
  serviceId: z.string().min(1, "Please select a service"),
  staffId: z.string().min(1, "Please select a staff member"),
  date: z.date({ required_error: "Please select a date" }),
  time: z.string().min(1, "Please select a time"),
});

type AppointmentForm = z.infer<typeof appointmentSchema>;

const serviceSchema = z.object({
  name: z.string().min(1, "Service name is required"),
  description: z.string().optional(),
  price: z.number().min(0, "Price must be positive"),
  duration: z.number().min(15, "Duration must be at least 15 minutes"),
});

const staffSchema = z.object({
  name: z.string().min(1, "Staff name is required"),
  email: z.string().email("Valid email is required").optional().or(z.literal("")),
  phone: z.string().optional(),
  specialization: z.string().optional(),
});

type ServiceForm = z.infer<typeof serviceSchema>;
type StaffForm = z.infer<typeof staffSchema>;

const timeSlots = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
  "15:00", "15:30", "16:00", "16:30", "17:00", "17:30"
];

export default function Dashboard() {
  const { user, logoutMutation } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [newAppointmentOpen, setNewAppointmentOpen] = useState(false);
  const [newServiceOpen, setNewServiceOpen] = useState(false);
  const [newStaffOpen, setNewStaffOpen] = useState(false);
  const [bookingLinkCopied, setBookingLinkCopied] = useState(false);

  const appointmentForm = useForm<AppointmentForm>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      customerName: "",
      customerEmail: "",
      customerPhone: "",
      serviceId: "",
      staffId: "",
      time: "",
    },
  });

  const serviceForm = useForm<ServiceForm>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      duration: 60,
    },
  });

  const staffForm = useForm<StaffForm>({
    resolver: zodResolver(staffSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      specialization: "",
    },
  });

  // Check if user has completed onboarding
  const { data: business, isLoading: businessLoading } = useQuery<Business>({
    queryKey: ["/api/business"],
  });

  const { data: appointments = [], isLoading: appointmentsLoading } = useQuery<Appointment[]>({
    queryKey: ["/api/appointments", selectedDate],
    enabled: !!business,
  });

  const { data: services = [], isLoading: servicesLoading } = useQuery<Service[]>({
    queryKey: ["/api/services"],
    enabled: !!business,
  });

  const { data: staff = [], isLoading: staffLoading } = useQuery<Staff[]>({
    queryKey: ["/api/staff"],
    enabled: !!business,
  });

  const { data: analytics } = useQuery<{
    totalAppointments: number;
    totalCustomers: number;
    totalRevenue: number;
    monthlyAppointments: number;
    totalServices: number;
    totalStaff: number;
    recentAppointments: Appointment[];
  }>({
    queryKey: ["/api/analytics"],
    enabled: !!business,
  });

  // Redirect to onboarding if no business found
  if (!businessLoading && !business) {
    setLocation("/onboarding");
    return <div>Redirecting...</div>;
  }

  const createAppointmentMutation = useMutation({
    mutationFn: async (data: AppointmentForm) => {
      const customerData = {
        name: data.customerName,
        email: data.customerEmail || undefined,
        phone: data.customerPhone,
      };

      const selectedService = services.find(s => s.id === parseInt(data.serviceId));
      const [hours, minutes] = data.time.split(":").map(Number);
      const startMinutes = hours * 60 + minutes;
      const endMinutes = startMinutes + (selectedService?.duration || 60);
      const endHours = Math.floor(endMinutes / 60);
      const endMins = endMinutes % 60;
      const endTime = `${endHours.toString().padStart(2, "0")}:${endMins.toString().padStart(2, "0")}`;

      const appointmentData = {
        serviceId: parseInt(data.serviceId),
        staffId: parseInt(data.staffId),
        date: format(data.date, "yyyy-MM-dd"),
        startTime: data.time,
        endTime,
        status: "confirmed" as const,
      };

      // Find or create customer
      const customerRes = await apiRequest("POST", `/api/book/${business?.id}/appointment`, {
        customerData,
        appointmentData,
      });
      return await customerRes.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
      setNewAppointmentOpen(false);
      appointmentForm.reset();
      toast({
        title: "Appointment created",
        description: "The appointment has been successfully scheduled.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to create appointment",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      setLocation("/");
    } catch (error) {
      // Error handled by mutation
    }
  };

  const createServiceMutation = useMutation({
    mutationFn: async (data: ServiceForm) => {
      const response = await apiRequest("POST", "/api/services", data);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/services"] });
      setNewServiceOpen(false);
      serviceForm.reset();
      toast({
        title: "Service created",
        description: "The service has been successfully added.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to create service",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const createStaffMutation = useMutation({
    mutationFn: async (data: StaffForm) => {
      const response = await apiRequest("POST", "/api/staff", data);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/staff"] });
      setNewStaffOpen(false);
      staffForm.reset();
      toast({
        title: "Staff member added",
        description: "The staff member has been successfully added.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to add staff member",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteServiceMutation = useMutation({
    mutationFn: async (serviceId: number) => {
      await apiRequest("DELETE", `/api/services/${serviceId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/services"] });
      toast({
        title: "Service deleted",
        description: "The service has been successfully removed.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to delete service",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteStaffMutation = useMutation({
    mutationFn: async (staffId: number) => {
      await apiRequest("DELETE", `/api/staff/${staffId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/staff"] });
      toast({
        title: "Staff member removed",
        description: "The staff member has been successfully removed.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to remove staff member",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onAppointmentSubmit = (data: AppointmentForm) => {
    createAppointmentMutation.mutate(data);
  };

  const onServiceSubmit = (data: ServiceForm) => {
    createServiceMutation.mutate(data);
  };

  const onStaffSubmit = (data: StaffForm) => {
    createStaffMutation.mutate(data);
  };

  const copyBookingLink = async () => {
    if (!business) return;
    const bookingUrl = `${window.location.origin}/book/${business.id}`;
    try {
      await navigator.clipboard.writeText(bookingUrl);
      setBookingLinkCopied(true);
      toast({
        title: "Booking link copied!",
        description: "Share this link with your customers to let them book appointments.",
      });
      setTimeout(() => setBookingLinkCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Failed to copy link",
        description: "Please copy the link manually from the address bar.",
        variant: "destructive",
      });
    }
  };

  const todayAppointments = appointments.filter(apt => apt.date === selectedDate);
  const todayRevenue = todayAppointments.reduce((sum, apt) => {
    const service = services.find(s => s.id === apt.serviceId);
    return sum + (service ? Number(service.price) : 0);
  }, 0);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (businessLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-blue-600 text-white p-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{business?.name} Dashboard</h1>
            <p className="text-blue-100">Welcome back, {user?.username}</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-2xl font-bold">{todayAppointments.length}</div>
              <div className="text-sm text-blue-100">Today's Bookings</div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">${todayRevenue.toFixed(2)}</div>
              <div className="text-sm text-blue-100">Today's Revenue</div>
            </div>
            <Button variant="secondary" onClick={handleLogout}>
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-border bg-muted/50">
        <div className="max-w-7xl mx-auto">
          <Tabs defaultValue="appointments" className="w-full">
            <TabsList className="grid w-full grid-cols-5 bg-transparent">
              <TabsTrigger value="appointments" className="flex items-center space-x-2">
                <Calendar className="h-4 w-4" />
                <span>Appointments</span>
              </TabsTrigger>
              <TabsTrigger value="customers" className="flex items-center space-x-2">
                <Users className="h-4 w-4" />
                <span>Customers</span>
              </TabsTrigger>
              <TabsTrigger value="services" className="flex items-center space-x-2">
                <Settings className="h-4 w-4" />
                <span>Services</span>
              </TabsTrigger>
              <TabsTrigger value="staff" className="flex items-center space-x-2">
                <Users className="h-4 w-4" />
                <span>Staff</span>
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center space-x-2">
                <BarChart3 className="h-4 w-4" />
                <span>Analytics</span>
              </TabsTrigger>
            </TabsList>

            <div className="p-6">
              <TabsContent value="appointments" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left Column - Today's Schedule */}
                  <div className="lg:col-span-2">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xl font-semibold">
                        Today's Schedule - {format(new Date(selectedDate), 'MMMM d, yyyy')}
                      </h2>
                      <Dialog open={newAppointmentOpen} onOpenChange={setNewAppointmentOpen}>
                        <DialogTrigger asChild>
                          <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            New Appointment
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                          <DialogHeader>
                            <DialogTitle>Create New Appointment</DialogTitle>
                            <DialogDescription>
                              Schedule a new appointment for a customer.
                            </DialogDescription>
                          </DialogHeader>
                          <form onSubmit={appointmentForm.handleSubmit(onAppointmentSubmit)} className="space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor="customerName">Customer Name</Label>
                              <Input
                                id="customerName"
                                {...appointmentForm.register("customerName")}
                                disabled={createAppointmentMutation.isPending}
                              />
                              {appointmentForm.formState.errors.customerName && (
                                <p className="text-sm text-destructive">
                                  {appointmentForm.formState.errors.customerName.message}
                                </p>
                              )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="customerEmail">Email</Label>
                                <Input
                                  id="customerEmail"
                                  type="email"
                                  {...appointmentForm.register("customerEmail")}
                                  disabled={createAppointmentMutation.isPending}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="customerPhone">Phone</Label>
                                <Input
                                  id="customerPhone"
                                  {...appointmentForm.register("customerPhone")}
                                  disabled={createAppointmentMutation.isPending}
                                />
                                {appointmentForm.formState.errors.customerPhone && (
                                  <p className="text-sm text-destructive">
                                    {appointmentForm.formState.errors.customerPhone.message}
                                  </p>
                                )}
                              </div>
                            </div>

                            <div className="space-y-2">
                              <Label>Service</Label>
                              <Select onValueChange={(value) => appointmentForm.setValue("serviceId", value)}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select service" />
                                </SelectTrigger>
                                <SelectContent>
                                  {services.map((service) => (
                                    <SelectItem key={service.id} value={service.id.toString()}>
                                      {service.name} - ${service.price} ({service.duration}min)
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              {appointmentForm.formState.errors.serviceId && (
                                <p className="text-sm text-destructive">
                                  {appointmentForm.formState.errors.serviceId.message}
                                </p>
                              )}
                            </div>

                            <div className="space-y-2">
                              <Label>Staff Member</Label>
                              <Select onValueChange={(value) => appointmentForm.setValue("staffId", value)}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select staff" />
                                </SelectTrigger>
                                <SelectContent>
                                  {staff.map((member) => (
                                    <SelectItem key={member.id} value={member.id.toString()}>
                                      {member.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              {appointmentForm.formState.errors.staffId && (
                                <p className="text-sm text-destructive">
                                  {appointmentForm.formState.errors.staffId.message}
                                </p>
                              )}
                            </div>

                            <div className="space-y-2">
                              <Label>Date</Label>
                              <CalendarComponent
                                mode="single"
                                selected={appointmentForm.watch("date")}
                                onSelect={(date) => {
                                  if (date) {
                                    appointmentForm.setValue("date", date);
                                  }
                                }}
                                disabled={(date) => date < new Date()}
                                className="rounded-md border"
                              />
                              {appointmentForm.formState.errors.date && (
                                <p className="text-sm text-destructive">
                                  {appointmentForm.formState.errors.date.message}
                                </p>
                              )}
                            </div>

                            <div className="space-y-2">
                              <Label>Time</Label>
                              <div className="grid grid-cols-3 gap-2">
                                {timeSlots.map((time) => (
                                  <Button
                                    key={time}
                                    type="button"
                                    variant={appointmentForm.watch("time") === time ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => appointmentForm.setValue("time", time)}
                                    disabled={createAppointmentMutation.isPending}
                                  >
                                    {time}
                                  </Button>
                                ))}
                              </div>
                              {appointmentForm.formState.errors.time && (
                                <p className="text-sm text-destructive">
                                  {appointmentForm.formState.errors.time.message}
                                </p>
                              )}
                            </div>

                            <div className="flex space-x-2">
                              <Button
                                type="submit"
                                disabled={createAppointmentMutation.isPending}
                                className="flex-1"
                              >
                                {createAppointmentMutation.isPending && (
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                )}
                                Create Appointment
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => setNewAppointmentOpen(false)}
                                disabled={createAppointmentMutation.isPending}
                              >
                                Cancel
                              </Button>
                            </div>
                          </form>
                        </DialogContent>
                      </Dialog>
                    </div>

                    {appointmentsLoading ? (
                      <div className="flex items-center justify-center p-8">
                        <Loader2 className="h-6 w-6 animate-spin" />
                      </div>
                    ) : todayAppointments.length === 0 ? (
                      <Card>
                        <CardContent className="p-8 text-center">
                          <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                          <h3 className="text-lg font-semibold mb-2">No appointments today</h3>
                          <p className="text-muted-foreground">
                            Your schedule is clear for today. Time to relax or catch up on other tasks!
                          </p>
                        </CardContent>
                      </Card>
                    ) : (
                      <div className="space-y-3">
                        {todayAppointments.map((appointment) => {
                          const service = services.find(s => s.id === appointment.serviceId);
                          const staffMember = staff.find(s => s.id === appointment.staffId);
                          
                          return (
                            <Card key={appointment.id} className="hover:shadow-md transition-shadow">
                              <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-4">
                                    <div className="text-primary font-semibold">
                                      {appointment.startTime}
                                    </div>
                                    <div>
                                      <div className="font-medium">Customer #{appointment.customerId}</div>
                                      <div className="text-sm text-muted-foreground">
                                        {service?.name} ({service?.duration} min)
                                      </div>
                                      <div className="text-sm text-muted-foreground">
                                        with {staffMember?.name}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <Badge className={getStatusColor(appointment.status)}>
                                      {appointment.status}
                                    </Badge>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Right Column - Quick Stats & Actions */}
                  <div className="space-y-6">
                    {/* Quick Stats */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Quick Stats</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">This Week</span>
                          <span className="font-semibold">{appointments.length} bookings</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Revenue</span>
                          <span className="font-semibold text-accent">${todayRevenue.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Services</span>
                          <span className="font-semibold">{services.length}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Staff Members</span>
                          <span className="font-semibold">{staff.length}</span>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Quick Actions */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Quick Actions</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <Button 
                          variant="outline" 
                          className="w-full justify-start"
                          onClick={() => setNewAppointmentOpen(true)}
                        >
                          <CalendarPlus className="h-4 w-4 mr-2" />
                          Add Appointment
                        </Button>
                        <Button variant="outline" className="w-full justify-start">
                          <UserPlus className="h-4 w-4 mr-2" />
                          Add New Client
                        </Button>
                        <Button variant="outline" className="w-full justify-start">
                          <Clock className="h-4 w-4 mr-2" />
                          Set Availability
                        </Button>
                        <Button 
                          variant="outline" 
                          className="w-full justify-start"
                          onClick={copyBookingLink}
                        >
                          {bookingLinkCopied ? (
                            <Check className="h-4 w-4 mr-2 text-green-600" />
                          ) : (
                            <Share2 className="h-4 w-4 mr-2" />
                          )}
                          {bookingLinkCopied ? "Link Copied!" : "Share Booking Link"}
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="customers">
                <Card>
                  <CardHeader>
                    <CardTitle>Customer Management</CardTitle>
                    <CardDescription>
                      Manage your customer database and appointment history
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center p-8">
                      <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">Customer management features coming soon!</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="services" className="space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-xl font-semibold">Services</h2>
                    <p className="text-muted-foreground">Manage your business services and pricing</p>
                  </div>
                  <Dialog open={newServiceOpen} onOpenChange={setNewServiceOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Service
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add New Service</DialogTitle>
                        <DialogDescription>
                          Create a new service for your business.
                        </DialogDescription>
                      </DialogHeader>
                      <form onSubmit={serviceForm.handleSubmit(onServiceSubmit)} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="serviceName">Service Name</Label>
                          <Input
                            id="serviceName"
                            {...serviceForm.register("name")}
                            disabled={createServiceMutation.isPending}
                          />
                          {serviceForm.formState.errors.name && (
                            <p className="text-sm text-destructive">
                              {serviceForm.formState.errors.name.message}
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="serviceDescription">Description</Label>
                          <Input
                            id="serviceDescription"
                            {...serviceForm.register("description")}
                            disabled={createServiceMutation.isPending}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="servicePrice">Price ($)</Label>
                            <Input
                              id="servicePrice"
                              type="number"
                              step="0.01"
                              {...serviceForm.register("price", { valueAsNumber: true })}
                              disabled={createServiceMutation.isPending}
                            />
                            {serviceForm.formState.errors.price && (
                              <p className="text-sm text-destructive">
                                {serviceForm.formState.errors.price.message}
                              </p>
                            )}
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="serviceDuration">Duration (min)</Label>
                            <Input
                              id="serviceDuration"
                              type="number"
                              {...serviceForm.register("duration", { valueAsNumber: true })}
                              disabled={createServiceMutation.isPending}
                            />
                            {serviceForm.formState.errors.duration && (
                              <p className="text-sm text-destructive">
                                {serviceForm.formState.errors.duration.message}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex space-x-2">
                          <Button
                            type="submit"
                            disabled={createServiceMutation.isPending}
                            className="flex-1"
                          >
                            {createServiceMutation.isPending && (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            Add Service
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setNewServiceOpen(false)}
                            disabled={createServiceMutation.isPending}
                          >
                            Cancel
                          </Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>

                {servicesLoading ? (
                  <div className="flex items-center justify-center p-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : services && services.length > 0 ? (
                  <div className="grid gap-4">
                    {services.map((service) => (
                      <Card key={service.id}>
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between">
                            <div className="space-y-1">
                              <h3 className="font-medium">{service.name}</h3>
                              {service.description && (
                                <p className="text-sm text-muted-foreground">{service.description}</p>
                              )}
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <DollarSign className="h-3 w-3" />
                                  ${service.price}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {service.duration}min
                                </span>
                              </div>
                            </div>
                            <div className="flex space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => deleteServiceMutation.mutate(service.id)}
                                disabled={deleteServiceMutation.isPending}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <p className="text-muted-foreground">
                        No services added yet. Add your first service to get started.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="staff" className="space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-xl font-semibold">Staff</h2>
                    <p className="text-muted-foreground">Manage your team members and their availability</p>
                  </div>
                  <Dialog open={newStaffOpen} onOpenChange={setNewStaffOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Staff
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add Staff Member</DialogTitle>
                        <DialogDescription>
                          Add a new team member to your business.
                        </DialogDescription>
                      </DialogHeader>
                      <form onSubmit={staffForm.handleSubmit(onStaffSubmit)} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="staffName">Full Name</Label>
                          <Input
                            id="staffName"
                            {...staffForm.register("name")}
                            disabled={createStaffMutation.isPending}
                          />
                          {staffForm.formState.errors.name && (
                            <p className="text-sm text-destructive">
                              {staffForm.formState.errors.name.message}
                            </p>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="staffEmail">Email</Label>
                            <Input
                              id="staffEmail"
                              type="email"
                              {...staffForm.register("email")}
                              disabled={createStaffMutation.isPending}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="staffPhone">Phone</Label>
                            <Input
                              id="staffPhone"
                              {...staffForm.register("phone")}
                              disabled={createStaffMutation.isPending}
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="staffSpecialization">Specialization</Label>
                          <Input
                            id="staffSpecialization"
                            {...staffForm.register("specialization")}
                            disabled={createStaffMutation.isPending}
                            placeholder="e.g., Hair Styling, Massage Therapy"
                          />
                        </div>

                        <div className="flex space-x-2">
                          <Button
                            type="submit"
                            disabled={createStaffMutation.isPending}
                            className="flex-1"
                          >
                            {createStaffMutation.isPending && (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            Add Staff Member
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setNewStaffOpen(false)}
                            disabled={createStaffMutation.isPending}
                          >
                            Cancel
                          </Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>

                {staffLoading ? (
                  <div className="flex items-center justify-center p-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : staff && staff.length > 0 ? (
                  <div className="grid gap-4">
                    {staff.map((member) => (
                      <Card key={member.id}>
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between">
                            <div className="space-y-1">
                              <h3 className="font-medium">{member.name}</h3>
                              {member.specialization && (
                                <Badge variant="secondary">{member.specialization}</Badge>
                              )}
                              <div className="space-y-1 text-sm text-muted-foreground">
                                {member.email && (
                                  <p className="flex items-center gap-1">
                                    <Mail className="h-3 w-3" />
                                    {member.email}
                                  </p>
                                )}
                                {member.phone && (
                                  <p className="flex items-center gap-1">
                                    <Phone className="h-3 w-3" />
                                    {member.phone}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="flex space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => deleteStaffMutation.mutate(member.id)}
                                disabled={deleteStaffMutation.isPending}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <p className="text-muted-foreground">
                        No staff members added yet. Add your first team member to get started.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="analytics" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Total Appointments
                      </CardTitle>
                      <CalendarPlus className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{analytics?.totalAppointments || 0}</div>
                      <p className="text-xs text-muted-foreground">
                        All time appointments
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Total Revenue
                      </CardTitle>
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">${analytics?.totalRevenue || 0}</div>
                      <p className="text-xs text-muted-foreground">
                        From completed appointments
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Total Customers
                      </CardTitle>
                      <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{analytics?.totalCustomers || 0}</div>
                      <p className="text-xs text-muted-foreground">
                        Unique customers served
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        This Month
                      </CardTitle>
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{analytics?.monthlyAppointments || 0}</div>
                      <p className="text-xs text-muted-foreground">
                        appointments this month
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Recent Appointments</CardTitle>
                    <CardDescription>
                      Your latest appointment bookings
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {analytics?.recentAppointments && analytics.recentAppointments.length > 0 ? (
                      <div className="space-y-4">
                        {analytics.recentAppointments.map((appointment) => (
                          <div key={appointment.id} className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <Badge variant={
                                  appointment.status === 'confirmed' ? 'default' :
                                  appointment.status === 'completed' ? 'secondary' :
                                  'destructive'
                                }>
                                  {appointment.status}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {format(new Date(appointment.date), "MMM d, yyyy")} at {appointment.startTime}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-medium">
                                {services?.find(s => s.id === appointment.serviceId)?.name}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {staff?.find(s => s.id === appointment.staffId)?.name}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-center text-muted-foreground py-8">
                        No appointments yet. Create your first appointment or share your booking link!
                      </p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
