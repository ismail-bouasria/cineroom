## 📄 Documentation du Contrat (V1.0) - CineRoom

Cette documentation sert de référence unique pour le développement du frontend et du backend.

### 1. Modèles de Données (Schémas JSON)

#### **La Ressource (Salle de Cinéma)**

Représente une salle réservable dans le système.

```json
{
  "id": "uuid",
  [cite_start]"name": "string",          // [cite: 65]
  [cite_start]"description": "string",   // [cite: 66]
  [cite_start]"capacity": "number",      // [cite: 69]
  [cite_start]"availability": "string",  // [cite: 67]
  [cite_start]"isActive": "boolean"      // [cite: 68]
}

```

#### **La Réservation (Booking)**

Représente l'engagement d'un utilisateur sur un créneau.

```json
{
  "id": "uuid",
  "roomId": "uuid",
  "userId": "uuid",
  "movieTitle": "string",
  "startTime": "ISO8601",
  "endTime": "ISO8601",
  [cite_start]"status": "active | modifiée | annulée | passée" // [cite: 59, 60, 61, 62, 63]
}

```

---

### 2. Le Contrat d'API (Endpoints & Codes HTTP)

Le frontend s'engage à gérer explicitement chaque réponse du serveur.

| Action | Méthode | Endpoint | Succès (2xx) | Erreur Métier (4xx) | Erreur Tech (5xx) |
| --- | --- | --- | --- | --- | --- |
| **Créer une réservation** | `POST` | `/api/reservations` | <br>**201** (Créée) 

 | <br>**409** (Conflit/Indisponible) 

 | <br>**500** (Serveur) 

 |
| **Modifier** | `PUT` | `/api/reservations/:id` | <br>**200** (Modifiée) 

 | <br>**403** (Non autorisé) 

 | **500** (Serveur) |
| **Annuler** | `DELETE` | `/api/reservations/:id` | <br>**204** (Annulée) 

 | <br>**404** (Introuvable) 

 | **500** (Serveur) |
| **Lister les salles** | `GET` | `/api/resources` | <br>**200** (Liste) 

 | <br>**401** (Non authentifié) 

 | **500** (Serveur) |

---

### 3. Gestion des États Applicatifs

Pour chaque appel réseau listé ci-dessus, le frontend **doit** implémenter les états suivants:

1. 
**Initial** : Avant l'appel.


2. 
**Chargement** : Pendant l'attente (Indicateur visuel obligatoire).


3. 
**Succès** : Données affichées ou message de confirmation.


4. 
**Erreur** : Message résilient expliquant le problème.


5. 
**Vide** : Cas où l'API renvoie une liste vide (ex: aucune réservation).

---

### 4. Sécurité & Authentification

* 
**Méthode** : Authentification via Magic Link gérée par Clerk.


* 
**Contrainte** : Aucun mot de passe ne doit transiter par l'application.


* 
**Règle d'or** : Le frontend assiste l'utilisateur, mais le backend valide systématiquement les droits (RBAC).

## 🏗️ Structure des Pages de CineRoom

Conformément au cahier des charges qui demande entre **12 et 14 pages**, voici comment nous allons structurer l'application :

### 🟢 Pages Publiques (Accessibles à tous)

* 
**Landing Page (`/`)** : Présentation de CineRoom et des salles de cinéma.


* 
**Page de Connexion (`/login`)** : Authentification exclusive par **Magic Link** via Clerk.



### 🔵 Pages Utilisateur (Authentifiées)

* 
**Dashboard (`/dashboard`)** : Vue d'ensemble de l'activité.


* 
**Liste des Salles (`/rooms`)** : Consultation des ressources (salles IMAX, Prestige, etc.).


* 
**Réserver une Salle (`/rooms/[id]/book`)** : Formulaire de création de réservation.


* 
**Détail d'une Séance (`/bookings/[id]`)** : Consultation et accès aux actions de modification/annulation.


* 
**Modifier une Séance (`/bookings/[id]/edit`)** : Formulaire de modification.


* 
**Historique (`/bookings`)** : Liste complète des réservations passées et actives.


* 
**Profil & Sécurité (`/profile`)** : Gestion du compte, 2FA et suppression de compte.



### 🔴 Pages Administrateur

* 
**Admin Dashboard (`/admin`)** : Statistiques globales d'occupation.


* 
**Gestion des Salles (`/admin/rooms`)** : CRUD des ressources (nom, capacité, activation).


* 
**Gestion Globale (`/admin/bookings`)** : Modération de toutes les réservations.



### ⚪ Pages Système

* 
**Erreurs (`401, 403, 404, 500`)** : Pages dédiées pour ne jamais bloquer l'utilisateur.


* 
**Chargement (`/loading`)** : État de chargement global pour la performance perçue.



---

## 📑 Rappel des Responsabilités du Frontend

Avant d'ouvrir ton éditeur de code, garde ces trois piliers en tête (issus de tes cours) :

1. 
**Le Frontend assiste, il ne garantit pas** : Même si tu vérifies la disponibilité en JS, le backend doit refaire la vérification lors du `POST`.


2. 
**Gestion de l'incertitude** : Tu dois prévoir ce qu'il se passe si le réseau est lent ou si l'API ne répond pas.


3. 
**Feedback systématique** : Chaque clic doit produire une réaction visuelle (bouton désactivé, spinner, message).



