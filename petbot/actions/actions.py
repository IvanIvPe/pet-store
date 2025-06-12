from rasa_sdk import Action, Tracker
from rasa_sdk.executor import CollectingDispatcher
from rasa_sdk.events import SlotSet, SessionStarted, ActionExecuted
from typing import Any, Text, Dict, List
import json
import inflect
import os

p = inflect.engine()

from rasa_sdk import Action, Tracker
from rasa_sdk.executor import CollectingDispatcher
from rasa_sdk.events import SlotSet
from typing import Any, Text, Dict, List
import json
import inflect

p = inflect.engine()

class ActionSearchPet(Action):
    def name(self) -> Text:
        return "action_search_pet"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:

        with open('pets.json', encoding='utf-8') as f:
            pets = json.load(f)

        pet_type = tracker.get_slot('type')
        origin = tracker.get_slot('origin')
        size = tracker.get_slot('size')
        price = tracker.get_slot('price')

        if pet_type:
            pet_type = p.singular_noun(pet_type) or pet_type
            pet_type = pet_type.strip().lower()
        if origin:
            origin = origin.strip().lower()
        if size:
            size = size.strip().lower()
        if price:
            try:
                price = float(price)
            except ValueError:
                price = None

        filtered_pets = pets

        if pet_type:
            filtered_pets = [
                pet for pet in filtered_pets
                if pet.get('type', '').strip().lower() == pet_type
            ]

        if origin and origin != "any":
            filtered_pets = [
                 pet for pet in filtered_pets
                if pet.get('origin', '').strip().lower() == origin
         ]


        if size:
            filtered_pets = [
                pet for pet in filtered_pets
                if pet.get('size', '').strip().lower() == size
            ]

        if price is not None:
            filtered_pets = [
                pet for pet in filtered_pets
                if pet.get('price', 0) <= price
            ]

        if filtered_pets:
            for pet in filtered_pets[:3]:
                message = (
                    f"<div class='pet-card'>"
                    f"<b>🐾 {pet['name']}</b><br><br>"
                    f"📋 <b>Description:</b> {pet['description']}<br>"
                    f"📌 <b>Type:</b> {pet['type']}<br>"
                    f"📏 <b>Size:</b> {pet['size']}<br>"
                    f"🌍 <b>Origin:</b> {pet['origin']}<br>"
                    f"💸 <b>Price:</b> {pet['price']} RSD<br><br>"
                    f"<img src='{pet.get('image', '')}' class='pet-image' width='120' /><br><br>"
                    f"<a href='http://localhost:4200/pet-details/{pet['id']}' target='_blank'>🔗 View details</a>"
                    f"</div>"
                )
                dispatcher.utter_message(text=message, html=True)
            
            return [SlotSet("origin", None)]
        
        else:
            dispatcher.utter_message(
                text="Unfortunately, I couldn't find a pet that matches your criteria.<br>Please try again with different options.",
                html=True
            )
            return [
                SlotSet("type", None),
                SlotSet("origin", None),
                SlotSet("size", None),
                SlotSet("price", None)
            ]



class ActionReservePet(Action):
    def name(self) -> Text:
        return "action_reserve_pet"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:

        metadata = tracker.latest_message.get("metadata", {})
        user_email = tracker.get_slot("user_email") or metadata.get("user_email") or "guest@example.com"

        pet_name = tracker.get_slot("name")
        if not pet_name:
            dispatcher.utter_message(text="Please tell me the name of the pet you'd like to reserve.")
            return []

        with open('pets.json', encoding='utf-8') as f:
            pets = json.load(f)

        selected_pet = next((pet for pet in pets if pet['name'].lower() == pet_name.lower()), None)

        if not selected_pet:
            dispatcher.utter_message(text=f"❌ Sorry, I couldn't find a pet named '{pet_name}'.")
            return []

        cart_file = 'cart.json'
        if not os.path.exists(cart_file):
            with open(cart_file, 'w', encoding='utf-8') as f:
                json.dump([], f)

        with open(cart_file, 'r', encoding='utf-8') as f:
            cart = json.load(f)

        for item in cart:
            if item['user'] == user_email and item['petId'] == selected_pet['id']:
                dispatcher.utter_message(text=f"ℹYou have already reserved {selected_pet['name']}.")
                return []

        cart.append({
            "user": user_email,
            "petId": selected_pet['id'],
            "status": "waiting"
        })

        with open(cart_file, 'w', encoding='utf-8') as f:
            json.dump(cart, f, indent=2)

        dispatcher.utter_message(
            text=f"✅ You have successfully reserved {selected_pet['name']}! "
                 f"It has been added to your cart."
        )

        return [SlotSet("user_email", user_email)]


class ActionShowCart(Action):
    def name(self) -> Text:
        return "action_show_cart"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:

        metadata = tracker.latest_message.get("metadata", {})
        user_email = tracker.get_slot("user_email") or metadata.get("user_email") or "guest@example.com"

        try:
            with open('cart.json', encoding='utf-8') as f:
                cart = json.load(f)
        except FileNotFoundError:
            dispatcher.utter_message(text="🛒 Your cart is empty.")
            return []

        user_cart = [item for item in cart if item['user'] == user_email]

        if not user_cart:
            dispatcher.utter_message(text="🛒 Your cart is empty.")
            return []

        with open('pets.json', encoding='utf-8') as f:
            pets = json.load(f)

        messages = ["📦 Your reserved pets:"]
        for item in user_cart:
            pet = next((p for p in pets if p['id'] == item['petId']), None)
            if pet:
                messages.append(
                    f"• {pet['name']} ({pet['type']}) - Status: {item['status']}"
                )

        dispatcher.utter_message(text="\n".join(messages))
        return [SlotSet("user_email", user_email)]


class ActionDebugSlots(Action):
    def name(self) -> Text:
        return "action_debug_slots"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:

        slots = tracker.current_slot_values()
        formatted = json.dumps(slots, indent=2)
        dispatcher.utter_message(text=f"Current slot values:\n{formatted}")
        return []


class ActionSessionStart(Action):
    def name(self) -> Text:
        return "action_session_start"

    def run(self,
            dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:

        events = [SessionStarted()]

        metadata = tracker.latest_message.get("metadata", {})
        user_email = metadata.get("user_email") or "guest@example.com"

        events.append(SlotSet("user_email", user_email))
        events.append(ActionExecuted("action_listen"))
        return events


class ActionCancelReservation(Action):
    def name(self) -> Text:
        return "action_cancel_reservation"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:

        metadata = tracker.latest_message.get("metadata", {})
        logged_in = tracker.get_slot("logged_in") or metadata.get("logged_in")
        user_email = tracker.get_slot("user_email") or metadata.get("user_email")

        if not logged_in or not user_email:
            dispatcher.utter_message(text="Please log in to cancel a reservation.")
            return []

        pet_name = tracker.get_slot("name")
        if not pet_name:
            dispatcher.utter_message(text="Please tell me the name of the pet you want to cancel reservation for.")
            return []

        try:
            with open('cart.json', encoding='utf-8') as f:
                cart = json.load(f)
        except FileNotFoundError:
            dispatcher.utter_message(text="You have no reservations to cancel.")
            return []

        with open('pets.json', encoding='utf-8') as f:
            pets = json.load(f)

        pet = next((p for p in pets if p['name'].lower() == pet_name.lower()), None)
        if not pet:
            dispatcher.utter_message(text=f"Pet '{pet_name}' not found.")
            return []

        initial_len = len(cart)
        cart = [item for item in cart if not (item['user'] == user_email and item['petId'] == pet['id'])]

        if len(cart) == initial_len:
            dispatcher.utter_message(text=f"You had no reservation for {pet_name}.")
            return []

        with open('cart.json', 'w', encoding='utf-8') as f:
            json.dump(cart, f, indent=2)

        dispatcher.utter_message(text=f"❌ Reservation for {pet_name} has been canceled.")
        return []


class ActionResetFilters(Action):
    def name(self) -> Text:
        return "action_reset_filters"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:

        dispatcher.utter_message(text="Filters have been reset. Let's start a new search!")

        return [
            SlotSet("type", None),
            SlotSet("origin", None),
            SlotSet("size", None),
            SlotSet("price", None)
        ]
