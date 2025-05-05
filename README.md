SmartPantryMuse -Recipe App

Description: This recipe app enables users to discover meal ideas based on their preferences and goals. When entering the app the user chooses their goals (for example weight loss, vegan, improving their relationship with food). Based on their goals the app suggests recipes via the database. Also, users are able to interact with an AI recipe assistant to enter ingredients that they currently have for five personalized meal recipes based on their preferences.

Problem Addressing: Meal planning can be stressful for persons who work but have dietary goals they want to achieve. This app will solve this issue by:
* Helping users build better relationships with food
* Providing structured recipes for their dietary goals.
* Offering interactive AI meal suggestions based on the users available ingredients 

Platform: This app will be built using React Native. Therefore it will be compatible with Web, IOS and Android.

Frontend & Backend Support:

Frontend- * React Native framework for UI and interactivity
          * React Navigation
          * Tailwing CSS
          
Backend-  * Spoonacular API for recipes
          * OPENAI API for generation personalized recipes
          * Firebase Firestore to store user data, preferences and recipes the user saves
          * Firebase Authentication to manage user logins (Google etc.)

Functionality:
* The user preference/goal - When a user enters the app they pick their dietary goal
* Recipe Suggestion - The user choice enables the app to suggest personalized recipes
* AI Recipe Assistant - This chat enables users to enter their ingredies and the AI suggests five recipes based on entries and their dietary goals
* Recipes are saved - Users bookmarked recipes are saved
* In depth Recipe instructions - Each recipe includes descriptive preparation steps

Design:
Wireframes
-The diagrams below are wireframes for this app. These diagrams show the apps user flow and interface design. 

Welcome Screen- The User starts the app by selecting their dietary goal to help personalize the users recipe recommendations

Home Screen- The Home Screen shows the recommended recipes based on the user selection and at the top allows users to enter ingredients for AI to recommend personalized meals

AI Chat- Users ingredients are typed here and AI generates five personalized recipes based on ingredient and dietary selection

Detailed Recipe- Users view the full recipe which includes calories, ingredients and step by step instructions. Users also have an option to bookmark the recipe.

** **Check the full wireframes in the [GitHub Wiki](https://github.com/petera-major/Recipe-App/wiki)**  


## Week 4 Project: Updates and Changelog

### Changes Made This Week
- Added bottom tab navigation (Home, Profile, Bookmarks, AI Chat)
- Separated AI Chat into its own tab (was previously on Home screen)
- Updated navigation flow after dietary goal selection
- Home screen now loads static recipe content for testing
- Set up layout for Profile and Bookmark tabs
- Preparing Firebase and API connections

### Version Changelog

Version - Summary of Changes 📋

**Week 3** - Basic screens in place: Goal Selection, Home, AI Chat on Home screen, no navigation tabs. No APIs or Firebase connected. 

**Week 4** - Navigation flow completed. Tab layout added. AI Chat moved to separate tab. Home screen recipes display static data. Firebase and API connections pending. 

**Week 5** - Connected Spoonacular and OpenAI APIs. Added real-time bookmarking via Firebase. Finalized user authentication via Firebase. Polished UI & error handling.

** **Full Project Outline in the [Github Wiki](https://github.com/petera-major/Recipe-App/wiki/Project-Outline)**
