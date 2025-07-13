import { 
  users, businesses, services, staff, availability, customers, appointments,
  type User, type InsertUser, type Business, type InsertBusiness,
  type Service, type InsertService, type Staff, type InsertStaff,
  type Availability, type InsertAvailability, type Customer, type InsertCustomer,
  type Appointment, type InsertAppointment
} from "@shared/schema";
import { db } from "./db";
import { eq, and, gte, lte, desc } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Business methods
  getBusiness(id: number): Promise<Business | undefined>;
  getBusinessByUserId(userId: number): Promise<Business | undefined>;
  createBusiness(business: InsertBusiness & { userId: number }): Promise<Business>;
  updateBusiness(id: number, business: Partial<Business>): Promise<Business>;

  // Service methods
  getServices(businessId: number): Promise<Service[]>;
  getService(id: number): Promise<Service | undefined>;
  createService(service: InsertService & { businessId: number }): Promise<Service>;
  updateService(id: number, service: Partial<Service>): Promise<Service>;
  deleteService(id: number): Promise<void>;

  // Staff methods
  getStaff(businessId: number): Promise<Staff[]>;
  getStaffMember(id: number): Promise<Staff | undefined>;
  createStaff(staff: InsertStaff & { businessId: number }): Promise<Staff>;
  updateStaff(id: number, staff: Partial<Staff>): Promise<Staff>;
  deleteStaff(id: number): Promise<void>;

  // Availability methods
  getAvailability(staffId: number): Promise<Availability[]>;
  createAvailability(availability: InsertAvailability): Promise<Availability>;
  updateAvailability(id: number, availability: Partial<Availability>): Promise<Availability>;
  deleteAvailability(id: number): Promise<void>;

  // Customer methods
  getCustomers(businessId: number): Promise<Customer[]>;
  getCustomer(id: number): Promise<Customer | undefined>;
  getCustomerByContact(businessId: number, email?: string, phone?: string): Promise<Customer | undefined>;
  createCustomer(customer: InsertCustomer & { businessId: number }): Promise<Customer>;
  updateCustomer(id: number, customer: Partial<Customer>): Promise<Customer>;

  // Appointment methods
  getAppointments(businessId: number, date?: string): Promise<Appointment[]>;
  getAppointment(id: number): Promise<Appointment | undefined>;
  createAppointment(appointment: InsertAppointment & { businessId: number }): Promise<Appointment>;
  updateAppointment(id: number, appointment: Partial<Appointment>): Promise<Appointment>;
  deleteAppointment(id: number): Promise<void>;

  sessionStore: any;
}

export class DatabaseStorage implements IStorage {
  sessionStore: any;

  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true 
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  // Business methods
  async getBusiness(id: number): Promise<Business | undefined> {
    const [business] = await db.select().from(businesses).where(eq(businesses.id, id));
    return business || undefined;
  }

  async getBusinessByUserId(userId: number): Promise<Business | undefined> {
    const [business] = await db.select().from(businesses).where(eq(businesses.userId, userId));
    return business || undefined;
  }

  async createBusiness(business: InsertBusiness & { userId: number }): Promise<Business> {
    const [newBusiness] = await db.insert(businesses).values(business).returning();
    return newBusiness;
  }

  async updateBusiness(id: number, business: Partial<Business>): Promise<Business> {
    const [updatedBusiness] = await db
      .update(businesses)
      .set(business)
      .where(eq(businesses.id, id))
      .returning();
    return updatedBusiness;
  }

  // Service methods
  async getServices(businessId: number): Promise<Service[]> {
    return await db.select().from(services).where(eq(services.businessId, businessId));
  }

  async getService(id: number): Promise<Service | undefined> {
    const [service] = await db.select().from(services).where(eq(services.id, id));
    return service || undefined;
  }

  async createService(service: InsertService & { businessId: number }): Promise<Service> {
    const [newService] = await db.insert(services).values(service).returning();
    return newService;
  }

  async updateService(id: number, service: Partial<Service>): Promise<Service> {
    const [updatedService] = await db
      .update(services)
      .set(service)
      .where(eq(services.id, id))
      .returning();
    return updatedService;
  }

  async deleteService(id: number): Promise<void> {
    await db.delete(services).where(eq(services.id, id));
  }

  // Staff methods
  async getStaff(businessId: number): Promise<Staff[]> {
    return await db.select().from(staff).where(eq(staff.businessId, businessId));
  }

  async getStaffMember(id: number): Promise<Staff | undefined> {
    const [staffMember] = await db.select().from(staff).where(eq(staff.id, id));
    return staffMember || undefined;
  }

  async createStaff(staffMember: InsertStaff & { businessId: number }): Promise<Staff> {
    const [newStaff] = await db.insert(staff).values(staffMember).returning();
    return newStaff;
  }

  async updateStaff(id: number, staffMember: Partial<Staff>): Promise<Staff> {
    const [updatedStaff] = await db
      .update(staff)
      .set(staffMember)
      .where(eq(staff.id, id))
      .returning();
    return updatedStaff;
  }

  async deleteStaff(id: number): Promise<void> {
    await db.delete(staff).where(eq(staff.id, id));
  }

  // Availability methods
  async getAvailability(staffId: number): Promise<Availability[]> {
    return await db.select().from(availability).where(eq(availability.staffId, staffId));
  }

  async createAvailability(availabilityData: InsertAvailability): Promise<Availability> {
    const [newAvailability] = await db.insert(availability).values(availabilityData).returning();
    return newAvailability;
  }

  async updateAvailability(id: number, availabilityData: Partial<Availability>): Promise<Availability> {
    const [updatedAvailability] = await db
      .update(availability)
      .set(availabilityData)
      .where(eq(availability.id, id))
      .returning();
    return updatedAvailability;
  }

  async deleteAvailability(id: number): Promise<void> {
    await db.delete(availability).where(eq(availability.id, id));
  }

  // Customer methods
  async getCustomers(businessId: number): Promise<Customer[]> {
    return await db.select().from(customers).where(eq(customers.businessId, businessId));
  }

  async getCustomer(id: number): Promise<Customer | undefined> {
    const [customer] = await db.select().from(customers).where(eq(customers.id, id));
    return customer || undefined;
  }

  async getCustomerByContact(businessId: number, email?: string, phone?: string): Promise<Customer | undefined> {
    if (email) {
      const [customer] = await db
        .select()
        .from(customers)
        .where(and(eq(customers.businessId, businessId), eq(customers.email, email)));
      if (customer) return customer;
    }
    
    if (phone) {
      const [customer] = await db
        .select()
        .from(customers)
        .where(and(eq(customers.businessId, businessId), eq(customers.phone, phone)));
      return customer || undefined;
    }
    
    return undefined;
  }

  async createCustomer(customer: InsertCustomer & { businessId: number }): Promise<Customer> {
    const [newCustomer] = await db.insert(customers).values(customer).returning();
    return newCustomer;
  }

  async updateCustomer(id: number, customer: Partial<Customer>): Promise<Customer> {
    const [updatedCustomer] = await db
      .update(customers)
      .set(customer)
      .where(eq(customers.id, id))
      .returning();
    return updatedCustomer;
  }

  // Appointment methods
  async getAppointments(businessId: number, date?: string): Promise<Appointment[]> {
    if (date) {
      return await db
        .select()
        .from(appointments)
        .where(and(eq(appointments.businessId, businessId), eq(appointments.date, date)))
        .orderBy(appointments.startTime);
    }
    
    return await db
      .select()
      .from(appointments)
      .where(eq(appointments.businessId, businessId))
      .orderBy(desc(appointments.createdAt));
  }

  async getAppointment(id: number): Promise<Appointment | undefined> {
    const [appointment] = await db.select().from(appointments).where(eq(appointments.id, id));
    return appointment || undefined;
  }

  async createAppointment(appointment: InsertAppointment & { businessId: number }): Promise<Appointment> {
    const [newAppointment] = await db.insert(appointments).values(appointment).returning();
    return newAppointment;
  }

  async updateAppointment(id: number, appointment: Partial<Appointment>): Promise<Appointment> {
    const [updatedAppointment] = await db
      .update(appointments)
      .set(appointment)
      .where(eq(appointments.id, id))
      .returning();
    return updatedAppointment;
  }

  async deleteAppointment(id: number): Promise<void> {
    await db.delete(appointments).where(eq(appointments.id, id));
  }
}

export const storage = new DatabaseStorage();
