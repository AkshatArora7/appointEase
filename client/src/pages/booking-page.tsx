import { useState } from "react";
import { useParams } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format, addDays, isBefore, isAfter, startOfDay } from "date-fns";
import { Calendar as CalendarIcon, Clock, User, Mail, Phone, CheckCircle, Loader2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Service, Staff } from "@shared/schema";

const bookingSchema = z.object({
  customerName: z.string().min(1, "Name is required"),
  customerEmail: z.string().email("Valid email is required").optional().or(z.literal("")),
  customerPhone: z.string().min(1, "Phone is required"),
  serviceId: z.string().min(1, "Please select a service"),
  staffId: z.string().min(1, "Please select a staff member"),
  date: z.string().min(1, "Please select a date"),
  time: z.string().min(1, "Please select a time"),
  notes: z.string().optional(),
});

type BookingForm = z.infer<typeof bookingSchema>;

const timeSlots = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
  "15:00", "15:30", "16:00", "16:30", "17:00", "17:30"
];

export default function BookingPage() {
  const params = useParams();
  const businessId = parseInt(params.businessId || "0");
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [bookingComplete, setBookingComplete] = useState(false);
  const { toast } = useToast();

  const { data: services = [], isLoading: servicesLoading } = useQuery<Service[]>({
    queryKey: [`/api/book/${businessId}/services`],
    enabled: !!businessId,
  });

  const { data: staff = [], isLoading: staffLoading } = useQuery<Staff[]>({
    queryKey: [`/api/book/${businessId}/staff`],
    enabled: !!businessId,
  });

  const form = useForm<BookingForm>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      customerName: "",
      customerEmail: "",
      customerPhone: "",
      serviceId: "",
      staffId: "",
      date: "",
      time: "",
      notes: "",
    },
  });

  const createBookingMutation = useMutation({
    mutationFn: async (data: BookingForm) => {
      const customerData = {
        name: data.customerName,
        email: data.customerEmail || undefined,
        phone: data.customerPhone,
        notes: data.notes || undefined,
      };

      const selectedService = services.find(s => s.id === parseInt(data.serviceId));
      const endTime = calculateEndTime(data.time, selectedService?.duration || 60);

      const appointmentData = {
        serviceId: parseInt(data.serviceId),
        staffId: parseInt(data.staffId),
        date: data.date,
        startTime: data.time,
        endTime,
        status: "pending" as const,
        notes: data.notes || undefined,
      };

      const res = await apiRequest("POST", `/api/book/${businessId}/appointment`, {
        customerData,
        appointmentData,
      });
      return await res.json();
    },
    onSuccess: () => {
      setBookingComplete(true);
      toast({
        title: "Booking request submitted!",
        description: "You'll receive a confirmation shortly.",
      });
    },
    onError: (error) => {
      toast({
        title: "Booking failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const calculateEndTime = (startTime: string, duration: number): string => {
    const [hours, minutes] = startTime.split(":").map(Number);
    const startMinutes = hours * 60 + minutes;
    const endMinutes = startMinutes + duration;
    const endHours = Math.floor(endMinutes / 60);
    const endMins = endMinutes % 60;
    return `${endHours.toString().padStart(2, "0")}:${endMins.toString().padStart(2, "0")}`;
  };

  const onSubmit = (data: BookingForm) => {
    createBookingMutation.mutate(data);
  };

  if (servicesLoading || staffLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (services.length === 0 || staff.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <h2 className="text-xl font-semibold mb-2">Booking Unavailable</h2>
            <p className="text-muted-foreground">
              This business is not currently accepting online bookings. 
              Please contact them directly to schedule an appointment.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (bookingComplete) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <CheckCircle className="h-16 w-16 text-accent mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Booking Request Submitted!</h2>
            <p className="text-muted-foreground mb-6">
              Thank you for your booking request. The business will contact you shortly 
              to confirm your appointment details.
            </p>
            <Button onClick={() => window.location.reload()}>
              Book Another Appointment
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-primary text-white p-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold">Book an Appointment</h1>
          <p className="text-blue-100">Schedule your visit with us</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Booking Form */}
          <Card>
            <CardHeader>
              <CardTitle>Appointment Details</CardTitle>
              <CardDescription>
                Fill out the form below to request an appointment
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Customer Information */}
                <div className="space-y-4">
                  <h3 className="font-semibold flex items-center">
                    <User className="h-4 w-4 mr-2" />
                    Your Information
                  </h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="customerName">Name *</Label>
                    <Input
                      id="customerName"
                      {...form.register("customerName")}
                      disabled={createBookingMutation.isPending}
                    />
                    {form.formState.errors.customerName && (
                      <p className="text-sm text-destructive">
                        {form.formState.errors.customerName.message}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="customerEmail">Email</Label>
                      <Input
                        id="customerEmail"
                        type="email"
                        {...form.register("customerEmail")}
                        disabled={createBookingMutation.isPending}
                      />
                      {form.formState.errors.customerEmail && (
                        <p className="text-sm text-destructive">
                          {form.formState.errors.customerEmail.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="customerPhone">Phone *</Label>
                      <Input
                        id="customerPhone"
                        {...form.register("customerPhone")}
                        disabled={createBookingMutation.isPending}
                      />
                      {form.formState.errors.customerPhone && (
                        <p className="text-sm text-destructive">
                          {form.formState.errors.customerPhone.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Service Selection */}
                <div className="space-y-4">
                  <h3 className="font-semibold">Service Selection</h3>
                  
                  <div className="space-y-2">
                    <Label>Service *</Label>
                    <Select onValueChange={(value) => form.setValue("serviceId", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a service" />
                      </SelectTrigger>
                      <SelectContent>
                        {services.map((service) => (
                          <SelectItem key={service.id} value={service.id.toString()}>
                            <div className="flex justify-between items-center w-full">
                              <div>
                                <span className="font-medium">{service.name}</span>
                                <span className="text-sm text-muted-foreground ml-2">
                                  ({service.duration} min)
                                </span>
                              </div>
                              <span className="font-semibold">${service.price}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {form.formState.errors.serviceId && (
                      <p className="text-sm text-destructive">
                        {form.formState.errors.serviceId.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Staff Member *</Label>
                    <Select onValueChange={(value) => form.setValue("staffId", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select staff member" />
                      </SelectTrigger>
                      <SelectContent>
                        {staff.map((member) => (
                          <SelectItem key={member.id} value={member.id.toString()}>
                            {member.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {form.formState.errors.staffId && (
                      <p className="text-sm text-destructive">
                        {form.formState.errors.staffId.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Date & Time Selection */}
                <div className="space-y-4">
                  <h3 className="font-semibold flex items-center">
                    <CalendarIcon className="h-4 w-4 mr-2" />
                    Date & Time
                  </h3>
                  
                  <div className="space-y-2">
                    <Label>Select Date *</Label>
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={(date) => {
                        setSelectedDate(date);
                        if (date) {
                          form.setValue("date", format(date, "yyyy-MM-dd"));
                        }
                      }}
                      disabled={(date) => 
                        isBefore(date, startOfDay(new Date())) || 
                        isAfter(date, addDays(new Date(), 30))
                      }
                      className="rounded-md border"
                    />
                    {form.formState.errors.date && (
                      <p className="text-sm text-destructive">
                        {form.formState.errors.date.message}
                      </p>
                    )}
                  </div>

                  {selectedDate && (
                    <div className="space-y-2">
                      <Label>Select Time *</Label>
                      <div className="grid grid-cols-3 gap-2">
                        {timeSlots.map((time) => (
                          <Button
                            key={time}
                            type="button"
                            variant={form.watch("time") === time ? "default" : "outline"}
                            size="sm"
                            onClick={() => form.setValue("time", time)}
                            disabled={createBookingMutation.isPending}
                          >
                            {time}
                          </Button>
                        ))}
                      </div>
                      {form.formState.errors.time && (
                        <p className="text-sm text-destructive">
                          {form.formState.errors.time.message}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Additional Notes */}
                <div className="space-y-2">
                  <Label htmlFor="notes">Additional Notes</Label>
                  <Textarea
                    id="notes"
                    {...form.register("notes")}
                    placeholder="Any special requests or information..."
                    disabled={createBookingMutation.isPending}
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={createBookingMutation.isPending}
                >
                  {createBookingMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Request Appointment
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Booking Summary */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Available Services</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {services.map((service) => (
                    <div key={service.id} className="p-4 border border-border rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold">{service.name}</h4>
                          {service.description && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {service.description}
                            </p>
                          )}
                          <div className="flex items-center mt-2 space-x-4">
                            <Badge variant="outline">
                              <Clock className="h-3 w-3 mr-1" />
                              {service.duration} min
                            </Badge>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold">${service.price}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Our Team</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {staff.map((member) => (
                    <div key={member.id} className="flex items-center space-x-3 p-3 border border-border rounded-lg">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium">{member.name}</h4>
                        <p className="text-sm text-muted-foreground capitalize">{member.role}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Important Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>• Appointments are subject to confirmation</p>
                  <p>• You'll receive a confirmation within 24 hours</p>
                  <p>• Please arrive 10 minutes early</p>
                  <p>• Cancellations require 24-hour notice</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
