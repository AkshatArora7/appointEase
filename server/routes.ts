import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { insertBusinessSchema, insertServiceSchema, insertStaffSchema, insertCustomerSchema, insertAppointmentSchema } from "@shared/schema";
import { z } from "zod";

export function registerRoutes(app: Express): Server {
  // Setup authentication routes
  setupAuth(app);

  // Business routes
  app.post("/api/business", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const businessData = insertBusinessSchema.parse(req.body);
      const business = await storage.createBusiness({
        ...businessData,
        userId: req.user!.id,
      });

      res.status(201).json(business);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/business", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const business = await storage.getBusinessByUserId(req.user!.id);
      if (!business) {
        return res.status(404).json({ message: "Business not found" });
      }

      res.json(business);
    } catch (error) {
      next(error);
    }
  });

  // Services routes
  app.get("/api/services", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const business = await storage.getBusinessByUserId(req.user!.id);
      if (!business) {
        return res.status(404).json({ message: "Business not found" });
      }

      const services = await storage.getServices(business.id);
      res.json(services);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/services", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const business = await storage.getBusinessByUserId(req.user!.id);
      if (!business) {
        return res.status(404).json({ message: "Business not found" });
      }

      const validatedData = insertServiceSchema.parse(req.body);
      const service = await storage.createService({
        ...validatedData,
        businessId: business.id,
      });
      res.status(201).json(service);
    } catch (error) {
      next(error);
    }
  });

  app.put("/api/services/:id", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const serviceId = parseInt(req.params.id);
      const validatedData = insertServiceSchema.partial().parse(req.body);
      const service = await storage.updateService(serviceId, validatedData);
      res.json(service);
    } catch (error) {
      next(error);
    }
  });

  app.delete("/api/services/:id", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const serviceId = parseInt(req.params.id);
      await storage.deleteService(serviceId);
      res.sendStatus(204);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/services", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const business = await storage.getBusinessByUserId(req.user!.id);
      if (!business) {
        return res.status(404).json({ message: "Business not found" });
      }

      const serviceData = insertServiceSchema.parse(req.body);
      const service = await storage.createService({
        ...serviceData,
        businessId: business.id,
      });

      res.status(201).json(service);
    } catch (error) {
      next(error);
    }
  });

  // Staff routes
  app.get("/api/staff", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const business = await storage.getBusinessByUserId(req.user!.id);
      if (!business) {
        return res.status(404).json({ message: "Business not found" });
      }

      const staff = await storage.getStaff(business.id);
      res.json(staff);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/staff", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const business = await storage.getBusinessByUserId(req.user!.id);
      if (!business) {
        return res.status(404).json({ message: "Business not found" });
      }

      const validatedData = insertStaffSchema.parse(req.body);
      const staff = await storage.createStaff({
        ...validatedData,
        businessId: business.id,
      });
      res.status(201).json(staff);
    } catch (error) {
      next(error);
    }
  });

  app.put("/api/staff/:id", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const staffId = parseInt(req.params.id);
      const validatedData = insertStaffSchema.partial().parse(req.body);
      const staff = await storage.updateStaff(staffId, validatedData);
      res.json(staff);
    } catch (error) {
      next(error);
    }
  });

  app.delete("/api/staff/:id", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const staffId = parseInt(req.params.id);
      await storage.deleteStaff(staffId);
      res.sendStatus(204);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/staff", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const business = await storage.getBusinessByUserId(req.user!.id);
      if (!business) {
        return res.status(404).json({ message: "Business not found" });
      }

      const staffData = insertStaffSchema.parse(req.body);
      const staffMember = await storage.createStaff({
        ...staffData,
        businessId: business.id,
      });

      res.status(201).json(staffMember);
    } catch (error) {
      next(error);
    }
  });

  // Appointments routes
  app.get("/api/appointments", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const business = await storage.getBusinessByUserId(req.user!.id);
      if (!business) {
        return res.status(404).json({ message: "Business not found" });
      }

      const date = req.query.date as string;
      const appointments = await storage.getAppointments(business.id, date);
      res.json(appointments);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/appointments", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const business = await storage.getBusinessByUserId(req.user!.id);
      if (!business) {
        return res.status(404).json({ message: "Business not found" });
      }

      const appointmentData = insertAppointmentSchema.parse(req.body);
      const appointment = await storage.createAppointment({
        ...appointmentData,
        businessId: business.id,
      });

      res.status(201).json(appointment);
    } catch (error) {
      next(error);
    }
  });

  // Public booking routes (no authentication required)
  app.get("/api/book/:businessId", async (req, res, next) => {
    try {
      const businessId = parseInt(req.params.businessId);
      const business = await storage.getBusiness(businessId);
      
      if (!business) {
        return res.status(404).json({ message: "Business not found" });
      }

      const [services, staff] = await Promise.all([
        storage.getServices(businessId),
        storage.getStaff(businessId)
      ]);

      res.json({
        business,
        services,
        staff
      });
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/book/:businessId/appointment", async (req, res, next) => {
    try {
      const businessId = parseInt(req.params.businessId);
      const { customerData, appointmentData } = req.body;

      // Find or create customer
      let customer = await storage.getCustomerByContact(
        businessId,
        customerData.email,
        customerData.phone
      );

      if (!customer) {
        const validatedCustomer = insertCustomerSchema.parse(customerData);
        customer = await storage.createCustomer({
          ...validatedCustomer,
          businessId,
        });
      }

      // Create appointment
      const validatedAppointment = insertAppointmentSchema.parse(appointmentData);
      const appointment = await storage.createAppointment({
        ...validatedAppointment,
        customerId: customer.id,
        businessId,
      });

      res.status(201).json({ appointment, customer });
    } catch (error) {
      next(error);
    }
  });

  // Analytics route
  app.get("/api/analytics", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const business = await storage.getBusinessByUserId(req.user!.id);
      if (!business) {
        return res.status(404).json({ message: "Business not found" });
      }

      const [appointments, customers, services, staff] = await Promise.all([
        storage.getAppointments(business.id),
        storage.getCustomers(business.id),
        storage.getServices(business.id),
        storage.getStaff(business.id)
      ]);

      const totalRevenue = appointments
        .filter(apt => apt.status === 'completed')
        .reduce((sum, apt) => {
          const service = services.find(s => s.id === apt.serviceId);
          return sum + (service?.price || 0);
        }, 0);

      const thisMonth = new Date();
      thisMonth.setDate(1);
      const monthlyAppointments = appointments.filter(apt => 
        new Date(apt.date) >= thisMonth
      );

      res.json({
        totalAppointments: appointments.length,
        totalCustomers: customers.length,
        totalRevenue,
        monthlyAppointments: monthlyAppointments.length,
        totalServices: services.length,
        totalStaff: staff.length,
        recentAppointments: appointments.slice(-10),
      });
    } catch (error) {
      next(error);
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
