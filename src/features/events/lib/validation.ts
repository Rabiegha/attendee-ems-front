import { z } from 'zod'

// Schéma de validation pour la création d'événement
export const createEventSchema = z.object({
  name: z.string()
    .min(3, 'Le nom doit contenir au moins 3 caractères')
    .max(100, 'Le nom ne peut pas dépasser 100 caractères'),
  
  description: z.string()
    .max(500, 'La description ne peut pas dépasser 500 caractères')
    .optional()
    .or(z.literal('')), // Permettre une chaîne vide
  
  startDate: z.string()
    .refine((date) => new Date(date) > new Date(), {
      message: "La date de début doit être dans le futur"
    }),
  
  endDate: z.string()
    .refine((date) => new Date(date) > new Date(), {
      message: "La date de fin doit être dans le futur"
    }),
  
  location: z.string()
    .max(200, 'Le lieu ne peut pas dépasser 200 caractères')
    .optional()
    .or(z.literal('')), // Permettre une chaîne vide
  
  maxAttendees: z.number()
    .min(1, 'Le nombre minimum de participants est 1')
    .max(10000, 'Le nombre maximum de participants est 10 000')
    .optional(), // Sans limite par défaut
  
  tags: z.array(z.string())
    .max(10, 'Vous ne pouvez pas ajouter plus de 10 tags')
    .optional()
}).refine((data) => new Date(data.endDate) > new Date(data.startDate), {
  message: "La date de fin doit être après la date de début",
  path: ["endDate"]
})

export type CreateEventFormData = z.infer<typeof createEventSchema>

// Schéma de base sans les refinements pour l'édition
const baseEventSchema = z.object({
  name: z.string().min(3).max(100),
  description: z.string().max(500).optional().or(z.literal('')),
  startDate: z.string(),
  endDate: z.string(),
  location: z.string().max(200).optional().or(z.literal('')),
  maxAttendees: z.number().min(1).max(10000).optional(),
  tags: z.array(z.string()).max(10).optional()
})

// Schéma pour l'édition (tous les champs optionnels sauf l'ID)
export const updateEventSchema = baseEventSchema.partial().extend({
  id: z.string()
})

export type UpdateEventFormData = z.infer<typeof updateEventSchema>
