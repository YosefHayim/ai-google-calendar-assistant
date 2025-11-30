"use client";

import { motion } from "framer-motion";
import { useForm } from "@tanstack/react-form";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RippleButton } from "@/components/ui/ripple-button";
import { Mail, Phone, MapPin, Send } from "lucide-react";

type ContactForm = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

const contactMethods = [
  {
    icon: Mail,
    title: "Email",
    description: "Send us an email anytime",
    value: "support@calai.com",
    href: "mailto:support@calai.com",
  },
  {
    icon: Phone,
    title: "Phone",
    description: "Mon-Fri from 8am to 6pm",
    value: "+1 (555) 123-4567",
    href: "tel:+15551234567",
  },
  {
    icon: MapPin,
    title: "Office",
    description: "Come say hello at our office",
    value: "San Francisco, CA",
    href: "#",
  },
];

export default function ContactPage() {
  const form = useForm({
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: "",
    } as ContactForm,
    onSubmit: async ({ value }) => {
      console.log("Contact form submitted:", value);
      alert("Thank you for your message! We'll get back to you soon.");
      form.reset();
    },
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex flex-col">
      <Navbar />

      <div className="container mx-auto px-4 py-16 flex-1">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-6xl mx-auto"
        >
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                Let's Talk
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Have a question or want to work together? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
              </p>
            </motion.div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 mb-16">
            {contactMethods.map((method, index) => {
              const Icon = method.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                  className="text-center p-6 rounded-lg border bg-card hover:shadow-lg transition-shadow"
                >
                  <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mx-auto mb-4">
                    <Icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="font-semibold mb-2">{method.title}</h3>
                  <p className="text-sm text-muted-foreground mb-3">{method.description}</p>
                  <a
                    href={method.href}
                    className="text-primary hover:underline font-medium text-sm"
                  >
                    {method.value}
                  </a>
                </motion.div>
              );
            })}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="max-w-2xl mx-auto"
          >
            <div className="rounded-lg border bg-card p-8 shadow-lg">
              <div className="mb-6">
                <h2 className="text-2xl font-semibold mb-2">Send us a message</h2>
                <p className="text-muted-foreground">Fill out the form below and we'll get back to you within 24 hours.</p>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  form.handleSubmit();
                }}
                className="space-y-6"
              >
                <div className="grid md:grid-cols-2 gap-6">
                  <form.Field
                    name="name"
                    validators={{
                      onChange: ({ value }) => {
                        if (!value) return "Name is required";
                        if (value.length < 2) {
                          return "Name must be at least 2 characters";
                        }
                        return undefined;
                      },
                    }}
                  >
                    {(field) => (
                      <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input
                          id="name"
                          type="text"
                          placeholder="John Doe"
                          className="h-11"
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value)}
                          onBlur={field.handleBlur}
                        />
                        {field.state.meta.errors.length > 0 && (
                          <p className="text-sm text-destructive">{field.state.meta.errors[0]}</p>
                        )}
                      </div>
                    )}
                  </form.Field>

                  <form.Field
                    name="email"
                    validators={{
                      onChange: ({ value }) => {
                        if (!value) return "Email is required";
                        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                          return "Please enter a valid email address";
                        }
                        return undefined;
                      },
                    }}
                  >
                    {(field) => (
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="john@example.com"
                          className="h-11"
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value)}
                          onBlur={field.handleBlur}
                        />
                        {field.state.meta.errors.length > 0 && (
                          <p className="text-sm text-destructive">{field.state.meta.errors[0]}</p>
                        )}
                      </div>
                    )}
                  </form.Field>
                </div>

                <form.Field
                  name="subject"
                  validators={{
                    onChange: ({ value }) => {
                      if (!value) return "Subject is required";
                      if (value.length < 3) {
                        return "Subject must be at least 3 characters";
                      }
                      return undefined;
                    },
                  }}
                >
                  {(field) => (
                    <div className="space-y-2">
                      <Label htmlFor="subject">Subject</Label>
                      <Input
                        id="subject"
                        type="text"
                        placeholder="How can we help?"
                        className="h-11"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        onBlur={field.handleBlur}
                      />
                      {field.state.meta.errors.length > 0 && (
                        <p className="text-sm text-destructive">{field.state.meta.errors[0]}</p>
                      )}
                    </div>
                  )}
                </form.Field>

                <form.Field
                  name="message"
                  validators={{
                    onChange: ({ value }) => {
                      if (!value) return "Message is required";
                      if (value.length < 10) {
                        return "Message must be at least 10 characters";
                      }
                      return undefined;
                    },
                  }}
                >
                  {(field) => (
                    <div className="space-y-2">
                      <Label htmlFor="message">Message</Label>
                      <Textarea
                        id="message"
                        placeholder="Tell us about your project or question..."
                        className="min-h-[150px]"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        onBlur={field.handleBlur}
                      />
                      {field.state.meta.errors.length > 0 && (
                        <p className="text-sm text-destructive">{field.state.meta.errors[0]}</p>
                      )}
                    </div>
                  )}
                </form.Field>

                <RippleButton type="submit" className="w-full h-11" size="lg">
                  <Send className="mr-2 h-4 w-4" />
                  Send Message
                </RippleButton>
              </form>
            </div>
          </motion.div>
        </motion.div>
      </div>

      <Footer />
    </div>
  );
}
