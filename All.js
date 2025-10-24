//===========================
// ACTORS.JS
//===========================

// Actor variables
var CurrentActor;
var Actor = [];
var ActorNamesText = null;
var ActorName = 0;
var ActorLove = 1;
var ActorSubmission = 2;
var ActorInventory = 3;
var ActorOrgasmCount = 4;
var ActorBondageCount = 5;
var ActorLastBondageChapter = 6;
var ActorCloth = 7;
var ActorPose = 8;
var ActorHideName = 9;
var ActorOwner = 10;

// Make sure the current actor is loaded (create it if not)
function ActorLoad(ActorToLoad, ActorLeaveScreen) {

	// Keep the actor leave screen
	LeaveIcon = "Leave";
	LeaveScreen = ActorLeaveScreen;

	// Sets if the actor is the player lover, submissive or Mistress
	CurrentActor = ActorToLoad;
	if (ActorToLoad == "") return;
	Common_ActorIsLover = (CurrentActor == Common_PlayerLover);
	Common_ActorIsOwner = (CurrentActor == Common_PlayerOwner);
	Common_ActorIsOwned = (ActorGetValue(ActorOwner) == "Player");

	// Load the actor if it's not already loaded
	for (var L = 0; L < Actor.length; L++)
		if (Actor[L][ActorName] == ActorToLoad)
			return;
	Actor[Actor.length] = [ActorToLoad, 0, 0, [], 0, 0, "", "Clothed", "", false, ""];

}

// Return a value from the current actor data
function ActorGetValue(ValueType) {
	for (var L = 0; L < Actor.length; L++)
		if (CurrentActor == Actor[L][ActorName])
			return Actor[L][ValueType];
}

// Return a value from a specific actor data
function ActorSpecificGetValue(SpecificActorName, ValueType) {
	for (var L = 0; L < Actor.length; L++)
		if (SpecificActorName == Actor[L][ActorName])
			return Actor[L][ValueType];
}

// Return the current actor's localized name
function ActorGetDisplayName() {
	if (ActorNamesText == null) ReadCSV("ActorNamesText", "C999_Common", "ActorNames", "Text", GetWorkingLanguageForChapter("C999_Common"));
	if (ActorGetValue(ActorHideName)) return GetCSVText(ActorNamesText, "Unknown");
	return GetCSVText(ActorNamesText, CurrentActor);
}

// Change positively or negatively the current actor attitude toward the player
function ActorChangeAttitude(LoveAttitude, SubAttitude) {

	// If we need to make a change to the attitude, we apply it
	if ((LoveAttitude != 0) || (SubAttitude != 0))
		for (var L = 0; L < Actor.length; L++)
			if (CurrentActor == Actor[L][ActorName]) {
				Actor[L][ActorLove] = Actor[L][ActorLove] + parseInt(LoveAttitude);
				Actor[L][ActorSubmission] = Actor[L][ActorSubmission] + parseInt(SubAttitude);
				if (Actor[L][ActorLove] > 99) Actor[L][ActorLove] = 99;
				if (Actor[L][ActorLove] < -99) Actor[L][ActorLove] = -99;
				if (Actor[L][ActorSubmission] > 99) Actor[L][ActorSubmission] = 99;
				if (Actor[L][ActorSubmission] < -99) Actor[L][ActorSubmission] = -99;
			}

}

// Change positively or negatively a specific actor attitude toward the player
function ActorSpecificChangeAttitude(SpecificActorName, LoveAttitude, SubAttitude) {

	// If we need to make a change to the attitude, we apply it
	if ((LoveAttitude != 0) || (SubAttitude != 0))
		for (var L = 0; L < Actor.length; L++)
			if (SpecificActorName == Actor[L][ActorName]) {
				Actor[L][ActorLove] = Actor[L][ActorLove] + parseInt(LoveAttitude);
				Actor[L][ActorSubmission] = Actor[L][ActorSubmission] + parseInt(SubAttitude);
			}

}

// Add an orgasm to the actor count and logs the event
function ActorAddOrgasm() {
	for (var L = 0; L < Actor.length; L++)
		if (CurrentActor == Actor[L][ActorName])
			Actor[L][ActorOrgasmCount]++;
	GameLogAdd("Orgasm");
}

// Validates that a specific interaction stage is available for the player
function ActorInteractionAvailable(LoveReq, SubReq, VarReq, InText, ForIntro) {

	// Make sure the love / sub level is match (both positive and negative)
	VarReq = VarReq.trim();
	InText = InText.trim();
	if ((parseInt(LoveReq) > 0) && (parseInt(ActorGetValue(ActorLove)) < parseInt(LoveReq))) return false;
	if ((parseInt(SubReq) > 0) && (parseInt(ActorGetValue(ActorSubmission)) < parseInt(SubReq))) return false;
	if ((parseInt(LoveReq) < 0) && (parseInt(ActorGetValue(ActorLove)) > parseInt(LoveReq))) return false;
	if ((parseInt(SubReq) < 0) && (parseInt(ActorGetValue(ActorSubmission)) > parseInt(SubReq))) return false;

	// Checks if there's a custom script variable or a common variable to process
	if(VarReq != ""){
		let negate = VarReq.substring(0,1) == "!";
		if(negate) VarReq = VarReq.substring(1);
		// whether to check global variable starting with Common_ or script variable starting with chapter and screen name
		let variableToCheck = (VarReq.substring(0,7) == "Common_" ? VarReq : CurrentChapter + "_" + CurrentScreen + "_" + VarReq);
		if(!!window[variableToCheck] === negate) return false;
	}

	// Check if the player is gagged, only interactions that starts with '(', '（' or '@' are allowed
	var nonSpeechActionsStart = [
		"(",
		"（", // Full-width bracket used in CJK languages
		"@",
	];
	if ((nonSpeechActionsStart.indexOf(InText.substr(0, 1)) < 0) && Common_PlayerGagged && !ForIntro) return false;

	// Since nothing blocks, we allow it
	return true;

}

// Add inventory to the current actor
function ActorAddInventory(NewInventory) {

	// Find the current actor and adds the inventory if it's not already the case
	for (var A = 0; A < Actor.length; A++)
		if (Actor[A][ActorName] == CurrentActor)
			if (Actor[A][ActorInventory].indexOf(NewInventory) == -1) {
				Actor[A][ActorInventory].push(NewInventory);
				if (Actor[A][ActorLastBondageChapter] != CurrentChapter) {
					Actor[A][ActorLastBondageChapter] = CurrentChapter;
					Actor[A][ActorBondageCount]++;
					GameLogAdd("Bondage");
				}
			}

}

// Add 1 to the bondage count of a specific actor
function ActorSpecificAddBondage(SpecificActor) {
	for (var A = 0; A < Actor.length; A++)
		if (Actor[A][ActorName] == SpecificActor) {
			Actor[A][ActorBondageCount]++;
			GameLogSpecificAdd(CurrentChapter, SpecificActor, "Bondage");
		}
}

// Returns the number of times that all actors were tied up during any chapter
function ActorGetTotalBondageCount() {
	var total = 0;
	for (var A = 0; A < Actor.length; A++)
		total = total + Actor[A][ActorBondageCount];
	return total;
}

// Remove inventory from the current actor
function ActorRemoveInventory(RemInventory) {

	// Find the current actor and adds the inventory if it's not already the case
	for (var A = 0; A < Actor.length; A++)
		if (Actor[A][ActorName] == CurrentActor)
			if (Actor[A][ActorInventory].indexOf(RemInventory) >= 0)
				Actor[A][ActorInventory].splice(Actor[A][ActorInventory].indexOf(RemInventory), 1);

}

// Returns true if the current actor has the queried inventory
function ActorHasInventory(QueryInventory) {

	// Cycles to find the correct actor and checks if the inventory is in the list
	for (var A = 0; A < Actor.length; A++)
		if (Actor[A][ActorName] == CurrentActor)
			if (Actor[A][ActorInventory].indexOf(QueryInventory) >= 0)
				return true;
	return false;

}

// Sets the clothes for the current actor
function ActorSetCloth(NewCloth) {
	for (var A = 0; A < Actor.length; A++)
		if (Actor[A][ActorName] == CurrentActor)
			Actor[A][ActorCloth] = NewCloth;
}

// Sets the owner for the current actor (collar the actor)
function ActorSetOwner(NewOwner) {
	for (var A = 0; A < Actor.length; A++)
		if (Actor[A][ActorName] == CurrentActor) {
			Actor[A][ActorOwner] = NewOwner;
			ActorAddInventory("Collar");
			GameLogAdd("CollaredBy" + NewOwner);
			if (NewOwner == "Player") Common_ActorIsOwned = true;
		}
}

// Sets the clothes for a specific actor
function ActorSpecificSetCloth(SpecificActor, NewCloth) {
	for (var A = 0; A < Actor.length; A++)
		if (Actor[A][ActorName] == SpecificActor)
			Actor[A][ActorCloth] = NewCloth;
}

// Set the pose for the current actor
function ActorSetPose(NewPose) {
	for (var A = 0; A < Actor.length; A++)
		if (Actor[A][ActorName] == CurrentActor)
			Actor[A][ActorPose] = NewPose;
}

// Sets the pose for a specified actor (also works for the player if needed)
function ActorSpecificSetPose(SpecificActor, NewPose) {
	if (SpecificActor == "Player") {
		Common_PlayerPose = NewPose;
	} else {
		for (var A = 0; A < Actor.length; A++)
			if (Actor[A][ActorName] == SpecificActor)
				Actor[A][ActorPose] = NewPose;
	}
}

// Returns TRUE if the actor (or player) is in visible bondage
function ActorSpecificInBondage(SpecificActor) {
	if (SpecificActor == "Player") {
		return (Common_PlayerRestrained || Common_PlayerGagged);
	} else {
		for (var A = 0; A < Actor.length; A++)
			if (Actor[A][ActorName] == SpecificActor)
				return (ActorSpecificHasInventory(SpecificActor, "Rope") || ActorSpecificHasInventory(SpecificActor, "TwoRopes") || ActorSpecificHasInventory(SpecificActor, "ThreeRopes") || ActorSpecificHasInventory(SpecificActor, "Armbinder") || ActorSpecificHasInventory(SpecificActor, "Cuffs") || ActorSpecificHasInventory(SpecificActor, "Manacles") || ActorSpecificHasInventory(SpecificActor, "BallGag") || ActorSpecificHasInventory(SpecificActor, "TapeGag") || ActorSpecificHasInventory(SpecificActor, "ClothGag") || ActorSpecificHasInventory(SpecificActor, "PantieGag") || ActorSpecificHasInventory(SpecificActor, "SockGag"));
	}
}

// Returns TRUE if a specific actor (or player) is restrained
function ActorSpecificIsRestrained(SpecificActor) {
	if (SpecificActor == "Player") {
		return Common_PlayerRestrained;
	} else {
		for (var A = 0; A < Actor.length; A++)
			if (Actor[A][ActorName] == SpecificActor)
				return (ActorSpecificHasInventory(SpecificActor, "Rope") || ActorSpecificHasInventory(SpecificActor, "TwoRopes") || ActorSpecificHasInventory(SpecificActor, "ThreeRopes") || ActorSpecificHasInventory(SpecificActor, "Armbinder") || ActorSpecificHasInventory(SpecificActor, "Cuffs") || ActorSpecificHasInventory(SpecificActor, "Manacles"));
	}
}

// Returns TRUE if a specific actor (or player) is restrained
function ActorSpecificIsGagged(SpecificActor) {
	if (SpecificActor == "Player") {
		return Common_PlayerGagged;
	} else {
		for (var A = 0; A < Actor.length; A++)
			if (Actor[A][ActorName] == SpecificActor)
				return (ActorSpecificHasInventory(SpecificActor, "BallGag") || ActorSpecificHasInventory(SpecificActor, "TapeGag") || ActorSpecificHasInventory(SpecificActor, "ClothGag"));
	}
}

// Returns true if the actor is restrained (if there's no actor, we return the player status)
function ActorIsRestrained() {
	if (CurrentActor == "")
		return Common_PlayerRestrained;
	else
		return (ActorHasInventory("Rope") || ActorHasInventory("TwoRopes") || ActorHasInventory("ThreeRopes") || ActorHasInventory("Armbinder") || ActorHasInventory("Cuffs") || ActorHasInventory("Manacles"));
}

// Returns true if the actor is gagged (if there's no actor, we return the player status)
function ActorIsGagged() {
	if (CurrentActor == "")
		return Common_PlayerGagged;
	else
		return (ActorHasInventory("BallGag") || ActorHasInventory("TapeGag") || ActorHasInventory("ClothGag") || ActorHasInventory("PantieGag") || ActorHasInventory("SockGag"));
}

// Returns true if the actor is chaste (if there's no actor, we return the player status)
function ActorIsChaste() {
	if (CurrentActor == "")
		return Common_PlayerChaste;
	else
		return (ActorHasInventory("ChastityBelt"));
}

// Unties the actor and returns the rope to the player
function ActorUntie() {
	if (ActorHasInventory("ThreeRopes")) { PlayerAddInventory("Rope", 1); ActorRemoveInventory("ThreeRopes"); }
	if (ActorHasInventory("TwoRopes")) { PlayerAddInventory("Rope", 1); ActorRemoveInventory("TwoRopes"); }
	if (ActorHasInventory("Rope")) { PlayerAddInventory("Rope", 1); ActorRemoveInventory("Rope"); }
	if (ActorHasInventory("Armbinder")) { PlayerAddInventory("Armbinder", 1); ActorRemoveInventory("Armbinder"); }
}

// Ungag the actor and returns the item if possible
function ActorUngag() {
	if (ActorHasInventory("BallGag")) { ActorRemoveInventory("BallGag"); PlayerAddInventory("BallGag", 1); }
	if (ActorHasInventory("ClothGag")) { ActorRemoveInventory("ClothGag"); PlayerAddInventory("ClothGag", 1); }
	if (ActorHasInventory("TapeGag")) ActorRemoveInventory("TapeGag");
	if (ActorHasInventory("PantieGag")) { ActorRemoveInventory("PantieGag"); PlayerAddInventory("PantieGag", 1); }
	if (ActorHasInventory("SockGag")) { ActorRemoveInventory("SockGag"); PlayerAddInventory("SockGag", 1); }
}

// Remove the blindfold from the actor and return it to the player
function ActorUnblindfold() {
	if (ActorHasInventory("Blindfold")) { ActorRemoveInventory("Blindfold"); PlayerAddInventory("Blindfold", 1); }
}

// Tries to apply a restrain on the current actor
function ActorApplyRestrain(RestrainName) {

	// The rope can be applied twice, the item becomes "TwoRopes"
	if ((RestrainName == "Rope") && ActorHasInventory("Rope") && !ActorHasInventory("TwoRopes") && PlayerHasInventory("Rope")) RestrainName = "TwoRopes";
	if ((RestrainName == "Rope") && ActorHasInventory("Rope") && ActorHasInventory("TwoRopes") && !ActorHasInventory("ThreeRopes") && PlayerHasInventory("Rope") && (PlayerGetSkillLevel("RopeMastery") >= 1)) RestrainName = "ThreeRopes";

	// If there's no text or the player is restrained, we assume we cannot apply the restrain
	var RestrainText = GetText(RestrainName);
	if ((RestrainText.substr(0, 20) != "MISSING TEXT FOR TAG") && (RestrainText != "") && !Common_PlayerRestrained && (PlayerHasInventory(RestrainName) || RestrainName == "TwoRopes" || RestrainName == "ThreeRopes") && !ActorHasInventory(RestrainName)) {

		// Third rope
		if (RestrainName == "ThreeRopes") {
			PlayerRemoveInventory("Rope", 1);
			ActorAddInventory("ThreeRopes");
			CurrentTime = CurrentTime + 60000;
		}

		// Second rope
		if (RestrainName == "TwoRopes") {
			PlayerRemoveInventory("Rope", 1);
			ActorAddInventory("TwoRopes");
			CurrentTime = CurrentTime + 60000;
		}

		// Regular restraints
		if ((RestrainName == "Rope") || (RestrainName == "Cuffs") || (RestrainName == "Armbinder")) {
			if (!ActorIsRestrained()) {
				PlayerRemoveInventory(RestrainName, 1);
				ActorAddInventory(RestrainName);
				CurrentTime = CurrentTime + 60000;
			} else return;
		}

		// Collar (only available in the Kinbaku club for now)
		if ((RestrainName == "Collar") && (CurrentChapter == "C101_KinbakuClub")) {
			PlayerRemoveInventory("Collar", 1);
			ActorAddInventory("Collar");
			CurrentTime = CurrentTime + 60000;
		}

		// Regular gags (gags can be swapped)
		if ((RestrainName == "BallGag") || (RestrainName == "TapeGag") || (RestrainName == "ClothGag")) {
			ActorUngag();
			PlayerRemoveInventory(RestrainName, 1);
			ActorAddInventory(RestrainName);
			CurrentTime = CurrentTime + 60000;
		}

		// Mouth filling before regular gags (only available in the Kinbaku club for now)
		if (((RestrainName == "PantieGag") || (RestrainName == "SockGag")) && !(ActorHasInventory("BallGag") || ActorHasInventory("ClothGag") || ActorHasInventory("TapeGag")) && (CurrentChapter == "C101_KinbakuClub")) {
			PlayerRemoveInventory(RestrainName, 1);
			ActorAddInventory(RestrainName);
			CurrentTime = CurrentTime + 60000;
		}


		// Blindfold (only available in the Kinbaku club for now)
		if ((RestrainName == "Blindfold") && (CurrentChapter == "C101_KinbakuClub")) {
			PlayerRemoveInventory("Blindfold", 1);
			ActorAddInventory("Blindfold");
			CurrentTime = CurrentTime + 60000;
		}

		// Vaginal items (cannot be used if the actor is chaste)
		if ((RestrainName == "ChastityBelt") || (RestrainName == "VibratingEgg")) {
			if (!ActorIsChaste()) {
				PlayerRemoveInventory(RestrainName, 1);
				ActorAddInventory(RestrainName);
				CurrentTime = CurrentTime + 60000;
			} else return;
		}

		// Anal items (cannot be used if the actor is chaste) (only available in the Kinbaku club for now)
		if ((RestrainName == "ChastityBelt") || (RestrainName == "ButtPlug")) {
			if (!ActorIsChaste()) {
				PlayerRemoveInventory(RestrainName, 1);
				ActorAddInventory(RestrainName);
				CurrentTime = CurrentTime + 60000;
			} else return;
		}

		// Cuffs key
		if (RestrainName == "CuffsKey") {
			if (ActorHasInventory("Cuffs")) {
				ActorRemoveInventory("Cuffs");
				PlayerAddInventory("Cuffs", 1);
				CurrentTime = CurrentTime + 60000;
			} else return;
		}

		// Show the text on the screen and jumps 1 minute
		OverridenIntroText = RestrainText;

	}

}

// Returns true if the queried actor has the queried inventory
function ActorSpecificHasInventory(QueryActor, QueryInventory) {

	// Cycles to find the correct actor and checks if the inventory is in the list
	for (var A = 0; A < Actor.length; A++)
		if (Actor[A][ActorName] == QueryActor)
			if (Actor[A][ActorInventory].indexOf(QueryInventory) >= 0)
				return true;
	return false;

}

// Clear all inventory from an actor (expect the egg, plug, chastitybelt and collar)
function ActorSpecificClearInventory(QueryActor, Recover) {
	for (var A = 0; A < Actor.length; A++)
		if (Actor[A][ActorName] == QueryActor) {
			var HadEgg = ActorSpecificHasInventory(QueryActor, "VibratingEgg");
			var HadPlug = ActorSpecificHasInventory(QueryActor, "ButtPlug");
			var HadCollar = ActorSpecificHasInventory(QueryActor, "Collar");
			var HadBelt = ActorSpecificHasInventory(QueryActor, "ChastityBelt");
			while (Actor[A][ActorInventory].length > 0) {
				if ((Actor[A][ActorInventory][0] != "VibratingEgg") && (Actor[A][ActorInventory][0] != "ButtPlug") && (Actor[A][ActorInventory][0] != "TwoRopes") && (Actor[A][ActorInventory][0] != "ThreeRopes") && (Actor[A][ActorInventory][0] != "Collar") && (Actor[A][ActorInventory][0] != "ChastityBelt") && (Actor[A][ActorInventory][0] != "TapeGag") && Recover)
					PlayerAddInventory(Actor[A][ActorInventory][0], 1);
				if ((Actor[A][ActorInventory][0] == "ThreeRopes") && Recover)
					PlayerAddInventory("Rope", 1);
				if ((Actor[A][ActorInventory][0] == "TwoRopes") && Recover)
					PlayerAddInventory("Rope", 1);
				Actor[A][ActorInventory].splice(0, 1);
			}
			if (HadEgg) Actor[A][ActorInventory].push("VibratingEgg");
			if (HadPlug) Actor[A][ActorInventory].push("ButtPlug");
			if (HadCollar) Actor[A][ActorInventory].push("Collar");
			if (HadBelt) Actor[A][ActorInventory].push("ChastityBelt");
		}
}

// Returns the actor image file to use
function ActorSpecificGetImage(QueryActor) {

	// The image file name is constructed from the inventory
	var ActorImage = QueryActor;
	if (ActorSpecificHasInventory(QueryActor, "Cuffs")) ActorImage = ActorImage + "_Cuffs";
	if (ActorSpecificHasInventory(QueryActor, "Rope")) ActorImage = ActorImage + "_Rope";
	if (ActorSpecificHasInventory(QueryActor, "Armbinder")) ActorImage = ActorImage + "_Armbinder";
	if (ActorSpecificHasInventory(QueryActor, "BallGag")) ActorImage = ActorImage + "_BallGag";
	if (ActorSpecificHasInventory(QueryActor, "TapeGag")) ActorImage = ActorImage + "_TapeGag";
	return ActorImage;

}

// Change specific actor  actors name on screen
function ActorSpecificConcealment(SpecificActor, Hidden) {
	for (var A = 0; A < Actor.length; A++)
		if (Actor[A][ActorName] == SpecificActor)
			Actor[A][ActorHideName] = Hidden;
}



//===========================
// CHEAT.JS
//===========================

var CheatAllow = false;
var TranslationCheatAllow = false;
var TranslationCacheCounter = 0; // used to bypass browser cache for CSV
var TranslationCurrentText = 0;
var TranslationCurrentStageFileLine = 0;
var TranslationSavedStage;

// Receives cheat keys
function CheatKey() {

	// No cheats until the player has a name
	if (Common_PlayerName != "") {
		// In a fight or a race, the user can press * to win automatically
		if (!FightEnded && (FightTimer > 0)) { if (KeyPress == 42) FightEnd(true); return; }
		if (!DoubleFightEnded && (DoubleFightTimer > 0)) { if (KeyPress == 42) DoubleFightEnd(true); return; }
		if (!RaceEnded && (RaceTimer > 0)) { if (KeyPress == 42) { RaceProgress = RaceGoal; RaceEnd(true); } return; }
		if (!QuizEnded && (QuizTimer > 0) && (QuizBetweenQuestionTimer == 0) && (QuizAnswerText == "")) { if (KeyPress == 42) { QuizAnswerText = QuizQuestion[QuizProgressLeft + QuizProgressRight][QuizQuestionAnswer1]; QuizAnswerBy = "Left"; QuizProgressLeft++; QuizBetweenQuestionTimer = QuizTimer + QuizOtherQuestionTime; } return; }

		// If we must manipulate time using + and -
		if (KeyPress == 43) CheatTime(900000);
		if (KeyPress == 45) CheatTime(-900000);

		// Specific cheats by functions
		if (CurrentActor != "") CheatActor();
		if ((CurrentChapter == "C012_AfterClass") && (CurrentScreen == "Dorm")) CheatDorm();
		if(TranslationCheatAllow) CheatTranslation(); else CheatSkill(); // skill modifiyng keys 5 - 9 are reused for translation related functions
		CheatInventory();

	}

}

// Cheats the clock by adding or removing time
function CheatTime(TimeChange) {

	// Time must be running to allow cheating it
	if (RunTimer) {

		// Change the main clock
		CurrentTime = CurrentTime + TimeChange;
		if (CurrentTime <= 0) CurrentTime = 1;

		// Change all the timed events in the game log to fit with that change
		for (var L = 0; L < GameLog.length; L++)
			if (GameLog[L][GameLogTimer] > 0) {
				GameLog[L][GameLogTimer] = GameLog[L][GameLogTimer] + TimeChange;
				if (GameLog[L][GameLogTimer] <= 0) GameLog[L][GameLogTimer] = 1;
				if (GameLog[L][GameLogTimer] > 24 * 60 * 60 * 1000) GameLog[L][GameLogTimer] = 24 * 60 * 60 * 1000;
			}

	}

}

// Cheats to change actor love or submission (from 1 to 4)
function CheatActor() {
	if (KeyPress == 49) ActorChangeAttitude(1, 0);
	if (KeyPress == 50) ActorChangeAttitude(-1, 0);
	if (KeyPress == 51) ActorChangeAttitude(0, 1);
	if (KeyPress == 52) ActorChangeAttitude(0, -1);
}

// Cheats to gain a skill (from 5 to 9)
function CheatSkill() {
	if (KeyPress == 53) PlayerAddSkill("Arts", 1);
	if (KeyPress == 54) PlayerAddSkill("Fighting", 1);
	if (KeyPress == 55) PlayerAddSkill("RopeMastery", 1);
	if (KeyPress == 56) PlayerAddSkill("Seduction", 1);
	if (KeyPress == 57) PlayerAddSkill("Sports", 1);
}

// Cheats used for text editing a translation
function CheatTranslation(){
	let stageTexts = CurrentStage;
	let texts = CurrentText;
	let screenPath = CurrentChapter + "_" + CurrentScreen;
	let displayedStageNumber;

	switch (KeyPress){
		case 47: // Slash key (/) forces reload of current texts from CSV
			let language = GetWorkingLanguage();
			let fileTypes = ["Intro","Stage","Text"];
			for(var c in fileTypes){
				var cachePath = CurrentChapter + "/" + CurrentScreen + "/" + fileTypes[c] + (language ? ("_" + language) : "") + ".csv"
				if(CSVCache[cachePath]) delete CSVCache[cachePath];
			}
			TranslationCacheCounter++;
			if(CurrentIntro !== null && CurrentStage !== null){
				LoadInteractions();
			} else if(CurrentText !== null){
				LoadText();
			}
			break;
		case 54: // number 6 key loads to OverridenIntroText previous text from Text_LANG file, number 9 loads next text
		case 57:
			if(texts && texts.length > 1){
				if(KeyPress === 57) TranslationCurrentText--; else TranslationCurrentText++;
				TranslationCurrentText = Math.min(texts.length - 1, Math.max(1, TranslationCurrentText));
				let displayText = texts[TranslationCurrentText][TextContent].trim();
				if(displayText !== "") OverridenIntroText = displayText; else OverridenIntroText = "** Text is empty";
			}
			break;
		case 53: // number 5 key loads to OverridenIntroText previous text from Stage_LANG file, number 8 loads next text
		case 56:
			// on first usage on given scene save actual stage
			if (!TranslationSavedStage || TranslationSavedStage.screen !== screenPath) {
				TranslationSavedStage = {
					stage: window[screenPath + "_CurrentStage"],
					screen: screenPath,
					overridenText: OverridenIntroText
				};
				TranslationCurrentStageFileLine = 1;
			}

			if(stageTexts && stageTexts.length > 1){
				if(KeyPress === 56) TranslationCurrentStageFileLine--; else TranslationCurrentStageFileLine++;
				TranslationCurrentStageFileLine = Math.min(stageTexts.length - 1, Math.max(1, TranslationCurrentStageFileLine));
				let displayText = stageTexts[TranslationCurrentStageFileLine][StageInteractionResult].trim();
				displayedStageNumber = stageTexts[TranslationCurrentStageFileLine][StageNumber];
				if(displayText !== "") OverridenIntroText = displayText; else OverridenIntroText = "** Stage has empty interaction result";
				window[screenPath + "_CurrentStage"] = displayedStageNumber;
				console.log("Stage: " + displayedStageNumber + " Line: " + (TranslationCurrentStageFileLine + 1));
			}
			break;
		case 55: // number 7 returns non overriden intro text for given stage (if present)
			OverridenIntroText = "";
			break;
		case 61: // key "=" reverts to last saved state
			if(TranslationSavedStage) {
				window[screenPath + "_CurrentStage"] = TranslationSavedStage.stage
				OverridenIntroText = TranslationSavedStage.overridenText
				TranslationSavedStage = undefined;
			}
			break;
		case 46: // "." flip variables of all prerequisites on displayed stage.
			TranslationCurrentStageFileLine = Math.min(stageTexts.length - 1, Math.max(1, TranslationCurrentStageFileLine));
			displayedStageNumber = stageTexts[TranslationCurrentStageFileLine][StageNumber];
			if(typeof displayedStageNumber !== undefined){
				// find prerequisites for given stage and negate it
				var flipped = {}; // stores which variables were already flipped
				for(var i in stageTexts){
					let prereqVarname = stageTexts[i][StageVarReq].trim();
					if(stageTexts[i][StageNumber] === displayedStageNumber && prereqVarname !== ""){
						let toFlip = "";
						if(prereqVarname.substring(0,1) == "!") prereqVarname = prereqVarname.substring(1);
						if(prereqVarname.substring(0,7) == "Common_"){
							toFlip = prereqVarname;
						}
						else {
							toFlip = screenPath + "_" + prereqVarname;
						}
						if(toFlip && !flipped[toFlip]){
							window[toFlip] = !window[toFlip];
							flipped[toFlip] = true;
							console.log("Flipped " + toFlip);
						}
					}
				}
			}
			break;
	}
}

// Cheats to add inventory (each letter represent an item)
function CheatInventory() {
	if ((KeyPress == 65) || (KeyPress == 97)) PlayerAddInventory("Armbinder", 1);
	if ((KeyPress == 66) || (KeyPress == 98)) PlayerAddInventory("BallGag", 1);
	if ((KeyPress == 67) || (KeyPress == 99)) PlayerAddInventory("Cuffs", 1);
	if ((KeyPress == 70) || (KeyPress == 102)) PlayerAddInventory("ChastityBelt", 1);
	if ((KeyPress == 71) || (KeyPress == 103)) PlayerAddInventory("ClothGag", 1);
	if ((KeyPress == 75) || (KeyPress == 107)) PlayerAddInventory("CuffsKey", 1);
	if ((KeyPress == 76) || (KeyPress == 108)) PlayerAddInventory("Collar", 1);
	if ((KeyPress == 80) || (KeyPress == 112)) PlayerAddInventory("Crop", 1);
	if ((KeyPress == 82) || (KeyPress == 114)) PlayerAddInventory("Rope", 1);
	if ((KeyPress == 83) || (KeyPress == 115)) PlayerAddInventory("SleepingPill", 1);
	if ((KeyPress == 84) || (KeyPress == 116)) PlayerAddInventory("TapeGag", 1);
	if ((KeyPress == 86) || (KeyPress == 118)) PlayerAddInventory("VibratingEgg", 1);
}

// Cheats that are specific to the player's dorm room
function CheatDorm() {

	// If the player isn't grounded, she can be released by using *
	if ((KeyPress == 42) && !GameLogQuery(CurrentChapter, "", "EventGrounded")) {
		PlayerReleaseBondage();
		if (PlayerHasLockedInventory("ChastityBelt")) { PlayerUnlockInventory("ChastityBelt"); PlayerAddInventory("ChastityBelt", 1); }
		if (PlayerHasLockedInventory("VibratingEgg")) { PlayerUnlockInventory("VibratingEgg"); PlayerAddInventory("VibratingEgg", 1); }
	}

}



//===========================
// COMMON.JS
//===========================

// Main variables
var CurrentIntro;
var CurrentStage;
var CurrentText;
var CurrentChapter;
var CurrentScreen;
var CurrentLanguageTag = "EN";
var OverridenIntroText;
var OverridenIntroImage;
var LeaveChapter = "";
var LeaveScreen = "";
var LeaveIcon = "";
var MouseX = 0;
var MouseY = 0;
var KeyPress = "";
var IsMobile = false;
var TextPhase = 0;
var CSVCache = {};
var MaxFightSequence = 500;
var MaxRaceSequence = 1000;
var AllowCheats = false;

// Array variables
var IntroStage = 0;
var IntroLoveReq = 1;
var IntroSubReq = 2;
var IntroVarReq = 3;
var IntroText = 4;
var	IntroImage = 5;
var StageNumber = 0;
var StageLoveReq = 1;
var StageSubReq = 2;
var StageVarReq = 3;
var StageInteractionText = 4;
var StageInteractionResult = 5;
var StageNextStage = 6;
var StageLoveMod = 7;
var StageSubMod = 8;
var StageFunction = 9;
var TextTag = 0;
var TextContent = 1;
var FightMoveType = 0;
var FightMoveTime = 1;
var RaceMoveType = 0;
var RaceMoveTime = 1;

// Common variables
var Common_BondageAllowed = true;
var Common_SelfBondageAllowed = true;
var Common_PlayerName = "";
var Common_PlayerOwner = "";
var Common_PlayerLover = "";
var Common_PlayerRestrained = false;
var Common_PlayerGagged = false;
var Common_PlayerBlinded = false;
var Common_PlayerChaste = false;
var Common_PlayerNotRestrained = true;
var Common_PlayerNotGagged = true;
var Common_PlayerNotBlinded = true;
var Common_PlayerClothed = true;
var Common_PlayerUnderwear = false;
var Common_PlayerNaked = false;
var Common_PlayerCloth = "";
var Common_PlayerCostume = "";
var Common_PlayerPose = "";
var Common_ActorIsLover = false;
var Common_ActorIsOwner = false;
var Common_ActorIsOwned = false;
var Common_Number = "";

// Returns TRUE if the variable is a number
function IsNumeric(n) {
	return !isNaN(parseFloat(n)) && isFinite(n);
}

// Returns the current date and time in a yyyy-mm-dd hh:mm:ss format
function GetFormatDate() {
	var d = new Date();
	var yyyy = d.getFullYear();
	var mm = d.getMonth() < 9 ? "0" + (d.getMonth() + 1) : (d.getMonth() + 1); // getMonth() is zero-based
	var dd  = d.getDate() < 10 ? "0" + d.getDate() : d.getDate();
	var hh = d.getHours() < 10 ? "0" + d.getHours() : d.getHours();
	var min = d.getMinutes() < 10 ? "0" + d.getMinutes() : d.getMinutes();
	var ss = d.getSeconds() < 10 ? "0" + d.getSeconds() : d.getSeconds();
	return "".concat(yyyy).concat("-").concat(mm).concat("-").concat(dd).concat(" ").concat(hh).concat(":").concat(min).concat(":").concat(ss);
}

// Used to detect whether the users browser is an mobile browser
function DetectMobile() {

	// First check
    if (sessionStorage.desktop) return false;
    else if (localStorage.mobile) return true;

    // Alternative check
    var mobile = ['iphone','ipad','android','blackberry','nokia','opera mini','windows mobile','windows phone','iemobile','mobile/'];
    for (var i in mobile) if (navigator.userAgent.toLowerCase().indexOf(mobile[i].toLowerCase()) > 0) return true;

    // If nothing is found, we assume desktop
    return false;
}

// Parse a CSV file
function ParseCSV(str) {

    var arr = [];
    var quote = false;  // true means we're inside a quoted field

    // iterate over each character, keep track of current row and column (of the returned array)
    for (var row = col = c = 0; c < str.length; c++) {
        var cc = str[c], nc = str[c+1];        // current character, next character
        arr[row] = arr[row] || [];             // create a new row if necessary
        arr[row][col] = arr[row][col] || '';   // create a new column (start with empty string) if necessary

        // If the current character is a quotation mark, and we're inside a
        // quoted field, and the next character is also a quotation mark,
        // add a quotation mark to the current column and skip the next character
        if (cc == '"' && quote && nc == '"') { arr[row][col] += cc; ++c; continue; }

        // If it's just one quotation mark, begin/end quoted field
        if (cc == '"') { quote = !quote; continue; }

        // If it's a comma and we're not in a quoted field, move on to the next column
        if (cc == ',' && !quote) { ++col; continue; }

        // If it's a newline and we're not in a quoted field, move on to the next
        // row and move to column 0 of that new row
        if (cc == '\n' && !quote) { ++row; col = 0; continue; }

        // Otherwise, append the current character to the current column
        arr[row][col] += cc;
    }
    return arr;
}

// Read a CSV file from the web site
function ReadCSV(Array, ChapterOrPath, Screen, Type, Language) {
    // Changed from a single path to various arguments and internally concatenate them
    // This ternary operator is used to keep backward compatibility
    var Path = (Screen && Type)
                 ? ChapterOrPath + "/" + Screen + "/" + Type + (Language ? "_" : "") + (Language || "") + ".csv"
                 : ChapterOrPath;

    if (CSVCache[Path]) {
        window[Array] = CSVCache[Path];
        return;
    }

    // Opens the file, parse it and returns the result in an array
    Get(Path + (TranslationCheatAllow ? "?force_" + TranslationCacheCounter : ""), function() {
        if (this.status == 200) {
            CSVCache[Path] = ParseCSV(this.responseText);
            window[Array] = CSVCache[Path];
        } else if (this.status == 404 && Language && Language != "EN") { // If language isn't EN and the file doesn't exist, then fallback to EN
            ReadCSV(Array, ChapterOrPath, Screen, Type, "EN");
        }
    });
}

// AJAX utility
function Get(Path, Callback) {
	var xhr = new XMLHttpRequest();
    xhr.open("GET", Path);
    xhr.onreadystatechange = function() { if (this.readyState == 4) Callback.bind(this)(); };
    xhr.send(null);
}

// Shuffles all array elements at random
function ArrayShuffle(a) {
    var j, x, i;
    for (i = a.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        x = a[i];
        a[i] = a[j];
        a[j] = x;
    }
    return a;
}

// Returns a working language if translation isn't fully ready
function GetWorkingLanguage() {
	return GetWorkingLanguageForChapter(CurrentChapter);
}

// Returns a working language for a specific chapter
function GetWorkingLanguageForChapter(Chapter) {
	if ((CurrentLanguageTag == "FR") && ["C000_Intro", "C001_BeforeClass", "C002_FirstClass", "C003_MorningDetention", "C004_ArtClass", "C005_GymClass", "C006_Isolation", "C007_LunchBreak", "C008_DramaClass", "C009_Library", "C999_Common"].indexOf(Chapter) >= 0) return "FR";
	if ((CurrentLanguageTag == "DE") && ["C000_Intro", "C001_BeforeClass", "C002_FirstClass", "C003_MorningDetention", "C004_ArtClass", "C005_GymClass", "C006_Isolation", "C007_LunchBreak", "C008_DramaClass", "C009_Library", "C010_Revenge", "C011_LiteratureClass", "C012_AfterClass", "C013_BondageClub", "C101_KinbakuClub", "C999_Common"].indexOf(Chapter) >= 0) return "DE";
	if ((CurrentLanguageTag == "PL") && ["C000_Intro"].indexOf(Chapter) >= 0) return "PL";
	if ((CurrentLanguageTag == "ES") && ["C000_Intro", "C001_BeforeClass", "C002_FirstClass", "C003_MorningDetention"].indexOf(Chapter) >= 0) return "ES";
	if ((CurrentLanguageTag == "CN") && ["C000_Intro", "C001_BeforeClass", "C002_FirstClass", "C003_MorningDetention", "C004_ArtClass", "C005_GymClass", "C006_Isolation","C009_Library", "C010_Revenge", "C011_LiteratureClass","C013_BondageClub","C999_Common"].indexOf(Chapter) >= 0) return "CN";
	if ((CurrentLanguageTag == "RU") && ["C000_Intro", "C001_BeforeClass"].indexOf(Chapter) >= 0) return "RU";
	if ((CurrentLanguageTag == "CS") && ["C000_Intro", "C001_BeforeClass", "C002_FirstClass", "C003_MorningDetention", "C004_ArtClass", "C005_GymClass", "C006_Isolation", "C007_LunchBreak", "C999_Common"].indexOf(Chapter) >= 0) return "CS";
	return "EN";
    //return CurrentLanguageTag;
}

// Load the interactions from a scene and keep it in common variable
function LoadInteractions() {
	ReadCSV("CurrentIntro", CurrentChapter, CurrentScreen, "Intro", GetWorkingLanguage());
	ReadCSV("CurrentStage", CurrentChapter, CurrentScreen, "Stage", GetWorkingLanguage());
	LoadText();
}

// Load the custom texts from a scene and keep it in common variable
function LoadText() {
	ReadCSV("CurrentText", CurrentChapter, CurrentScreen, "Text", GetWorkingLanguage());
}

// Calls a dynamic function (if it exists)
function DynamicFunction(FunctionName) {
	if (typeof window[FunctionName.substr(0, FunctionName.indexOf("("))] == "function") {
		var Fct = new Function(FunctionName);
		Fct();
	} else console.log("Trying to launch invalid function: " + FunctionName);
}

// Set the current scene (chapter and screen)
function SetScene(Chapter, Screen) {

	// Keep the chapter and screen
	CurrentStage = null;
	CurrentIntro = null;
	CurrentText = null;
	CurrentActor = "";
	CurrentChapter = Chapter;
	CurrentScreen = Screen;
	OverridenIntroText = "";
	OverridenIntroImage = "";
	LeaveIcon = "";
	LeaveScreen = "";
	LeaveChapter = Chapter;
	Common_ActorIsLover = false;
	Common_ActorIsOwner = false;
	Common_ActorIsOwned = false;

	// Load the screen code
	DynamicFunction(CurrentChapter + "_" + CurrentScreen + "_Load()");

}

// Validates if any interaction was clicked
function ClickInteraction(CurrentStagePosition) {

	// Make sure the current stage is loaded
	if (CurrentStage != null) {

		// If a regular option was clicked, we process it
		var Pos = 0;
		for (var L = 0; L < CurrentStage.length; L++)
			if (CurrentStage[L][StageNumber] == CurrentStagePosition)
				if (ActorInteractionAvailable(CurrentStage[L][StageLoveReq], CurrentStage[L][StageSubReq], CurrentStage[L][StageVarReq], CurrentStage[L][StageInteractionText], false)) {
					if ((MouseX >= (Pos % 2) * 300) && (MouseX <= ((Pos % 2) * 300) + 299) && (MouseY >= 151 + (Math.round((Pos - 1) / 2) * 90)) && (MouseY <= 240 + (Math.round((Pos - 1) / 2) * 90))) {
						window[CurrentChapter + "_" + CurrentScreen + "_CurrentStage"] = CurrentStage[L][StageNextStage];
						OverridenIntroText = CurrentStage[L][StageInteractionResult];
						ActorChangeAttitude(CurrentStage[L][StageLoveMod], CurrentStage[L][StageSubMod]);
						// Check if the interaction has a time tag
						var MinuteString = "ADD_MINUTES:";
						var MinuteStringIndex = CurrentStage[L][StageInteractionText].indexOf(MinuteString);
						if (MinuteStringIndex >= 0) {
							var MinuteCount = parseInt(CurrentStage[L][StageInteractionText].substring(MinuteStringIndex + MinuteString.length));
							// If the text after the tag isn't a valid number, output a log message and assume the default time
							if (isNaN(MinuteCount)) {
								console.log("Invalid minute expression in interaction: " + CurrentStage[L][StageInteractionText]);
								CurrentTime = CurrentTime + 10000;
							}
							else CurrentTime = CurrentTime + MinuteCount * 60000;
						}
						else CurrentTime = CurrentTime + 10000;
						if (CurrentStage[L][StageFunction].trim() != "") DynamicFunction(CurrentChapter + "_" + CurrentScreen + "_" + CurrentStage[L][StageFunction].trim());
						return;
					}
					Pos = Pos + 1;
				}

	}

}

// Returns the text for the current scene associated with the tag
function GetText(Tag) {

	// Make sure the text CSV file is loaded
	if (CurrentText != null) {

		// Cycle the text to find a matching tag and returns the text content
		Tag = Tag.trim().toUpperCase();
		for (var T = 0; T < CurrentText.length; T++)
			if (CurrentText[T][TextTag].trim().toUpperCase() == Tag)
				return CurrentText[T][TextContent].trim();

		// Returns an error message
		return "MISSING TEXT FOR TAG: " + Tag.trim();

	} else return "";

}

// Returns the text for a specific CSV associated with the tag
function GetCSVText(CSVText, Tag) {

	// Make sure the text CSV file is loaded
	if (CSVText != null) {

		// Cycle the text to find a matching tag and returns the text content
		Tag = Tag.trim().toUpperCase();
		for (var T = 0; T < CSVText.length; T++)
			if (CSVText[T][TextTag].trim().toUpperCase() == Tag)
				return CSVText[T][TextContent].trim();

		// Returns an error message
		return "MISSING TEXT FOR TAG: " + Tag.trim();

	} else return "";

}

// Triggers the leave or wait button if needed
function LeaveButtonClick() {

	// If the wait option was clicked, we skip 2 minutes
	if (LeaveIcon == "Wait")
		if ((MouseX >= 1125) && (MouseX <= 1200) && (MouseY >= 600) && (MouseY <= 675))
			CurrentTime = CurrentTime + 120000;

	// If the leave option was clicked, we return to the previous screen
	if ((LeaveIcon == "Leave") && (LeaveScreen != ""))
		if ((MouseX >= 1125) && (MouseX <= 1200) && (MouseY >= 600) && (MouseY <= 675))
			SetScene(LeaveChapter, LeaveScreen);

}

// Creates a path from the supplied paths parts
function GetPath(paths) {
    var path = arguments[0];
    for (var index = 1; index < arguments.length; index++) {
        path += "/" + arguments[index];
    }
    return path;
}



//===========================
// DRAWING.JS
//===========================

// The main game canvas where everything will be drawn
var MainCanvas;

// A bank of all the cached images
var CacheImage = {};

// Icons bank and paths
var Icons = new function () {
    this.Path = GetPath("Icons");
    this.Fight = new function (parent) {
        this.Path = GetPath("C999_Common", "Fights", "Icons");
        this.Punch = GetIconPath(this.Path, "Punch");
        this.Rope = GetIconPath(this.Path, "Rope");
        this.TennisBall = GetIconPath(this.Path, "TennisBall");
    }(this);
    this.Race = new function (parent) {
        this.Path = GetPath("C999_Common", "Races", "Icons");
        this.ElbowBound = GetIconPath(this.Path, "ElbowBound");
        this.KneeBound = GetIconPath(this.Path, "KneeBound");
    }(this);
    this.Navigation = new function (parent) {
        this.Path = GetPath("Icons", "Navigation");
        this.ArrowLeftActive = GetIconPath(this.Path, "ArrowLeftActive");
        this.ArrowRightActive = GetIconPath(this.Path, "ArrowRightActive");
        this.ArrowUpActive = GetIconPath(this.Path, "ArrowUpActive");
        this.ArrowDownActive = GetIconPath(this.Path, "ArrowDownActive");
        this.ArrowLeftInactive = GetIconPath(this.Path, "ArrowLeftInactive");
        this.ArrowRightInactive = GetIconPath(this.Path, "ArrowRightInactive");
        this.ArrowUpInactive = GetIconPath(this.Path, "ArrowUpInactive");
        this.ArrowDownInactive = GetIconPath(this.Path, "ArrowDownInactive");
    }(this);
}();

// Returns the image file or build it from the source
function DrawGetImage(Source) {

    // Search in the cache to find the image
    if (!CacheImage[Source]) {
        var img = new Image;
        img.src = Source;
        CacheImage[Source] = img;
    }

    // returns the final image
    return CacheImage[Source];
}

// Draw a zoomed image from a source to the canvas
function DrawImageZoom(Source, SX, SY, SWidth, SHeight, X, Y, Width, Height) {
	MainCanvas.drawImage(DrawGetImage(Source), SX, SY, Math.round(SWidth), Math.round(SHeight), X, Y, Width, Height);
}

// Draw a zoomed image from a source to the canvas and mirrors it from left to right
function DrawImageZoomMirror(Source, SX, SY, SWidth, SHeight, X, Y, Width, Height) {
	MainCanvas.save();
    MainCanvas.scale(-1, 1);
	MainCanvas.drawImage(DrawGetImage(Source), X * -1, Y, Width * -1, Height);
    MainCanvas.restore();
}

// Draw an image from a source to the canvas
function DrawImage(Source, X, Y) {
	MainCanvas.drawImage(DrawGetImage(Source), X, Y);
}

// Draw an image from a source to the canvas
function DrawImageMirror(Source, X, Y) {
	MainCanvas.save();
    MainCanvas.scale(-1, 1);
	MainCanvas.drawImage(DrawGetImage(Source), X * -1, Y);
    MainCanvas.restore();
}

// Draw a text in the canvas
function DrawText(Text, X, Y, Color) {

	// Replace the COMMON_PLAYERNAME keyword with the player name
	Text = Text.replace("COMMON_PLAYERNAME", Common_PlayerName);

	// Replace the COMMON_NUMBER keyword with a number generated while playing the game
	Text = Text.replace("COMMON_NUMBER", Common_Number);

	// Remove the timing tag if present
	if (Text.indexOf("ADD_MINUTES:") >= 0)
		Text = Text.substring(0, Text.indexOf("ADD_MINUTES:"));

	// Font is fixed for now, color can be set
	MainCanvas.font = "24px Arial";
	MainCanvas.fillStyle = Color;
	MainCanvas.textAlign = "center";
	MainCanvas.textBaseline = "middle";

	// Split the text on two lines if there's a |
	if (Text.indexOf("|") == -1)
		MainCanvas.fillText(Text, X, Y);
	else {
		MainCanvas.fillText(Text.substring(0, Text.indexOf("|")), X, Y - 19);
		MainCanvas.fillText(Text.substring(Text.indexOf("|") + 1, 1000), X, Y + 19);
	}

}

// Draw a button
function DrawButton(Left, Top, Width, Height, Label) {

	// Draw the button rectangle
	MainCanvas.beginPath();
	MainCanvas.rect(Left, Top, Width, Height);
    MainCanvas.fillStyle = 'white';
    MainCanvas.fillRect(Left, Top, Width, Height);
	MainCanvas.fill();
	MainCanvas.lineWidth = '2';
	MainCanvas.strokeStyle = 'black';
	MainCanvas.stroke();
	MainCanvas.closePath();

	// Draw the text
	DrawText(Label, Left + Width / 2, Top + Height / 2, "black");

}

// Draw a basic rectangle
function DrawRect(Left, Top, Width, Height, Color) {
	MainCanvas.beginPath();
	MainCanvas.rect(Left, Top, Width, Height);
    MainCanvas.fillStyle = Color;
    MainCanvas.fillRect(Left, Top, Width, Height);
	MainCanvas.fill();
	MainCanvas.closePath();
}

// Draw a basic circle
function DrawCircle(CenterX, CenterY, Radius, LineWidth, LineColor) {
	MainCanvas.beginPath();
	MainCanvas.arc(CenterX, CenterY, Radius, 0, 2 * Math.PI, false);
	MainCanvas.lineWidth = LineWidth;
	MainCanvas.strokeStyle = LineColor;
	MainCanvas.stroke();
}

// Draw --- if zero, +value in green if positive, -value in red if negative
function DrawPosNegValue(Value, X, Y) {
	if (Value == 0) DrawText("---", X, Y, "black");
	if (Value > 0) DrawText("+" + Value.toString(), X, Y, "#00BB00");
	if (Value < 0) DrawText(Value.toString(), X, Y, "#BB0000");
}

// Draw the current actor stats toward the player
function DrawActorStats(Left, Top) {

	// Draw the actor name and icon
	DrawText(ActorGetDisplayName(), Left - 200, Top + 17, "black");
	if (CurrentActor == Common_PlayerLover) DrawImage("Icons/Lover.png", Left - 110, Top);
	else DrawImage("Icons/Heart.png", Left - 110, Top);
	if (ActorGetValue(ActorOwner) == "Player") DrawImage("Icons/Collared.png", Left - 10, Top);
	else if (CurrentActor == Common_PlayerOwner) DrawImage("Icons/Owner.png", Left - 10, Top);
	else DrawImage("Icons/Submission.png", Left - 10, Top);
	DrawImage("Icons/Orgasm.png", Left + 90, Top);
	DrawImage("Icons/Bondage.png", Left + 190, Top);
	DrawPosNegValue(ActorGetValue(ActorLove), Left - 50, Top + 17);
	DrawPosNegValue(ActorGetValue(ActorSubmission), Left + 50, Top + 17);
	DrawText(ActorGetValue(ActorOrgasmCount).toString(), Left + 150, Top + 17, "black");
	DrawText(ActorGetValue(ActorBondageCount).toString(), Left + 250, Top + 17, "black");

}

// Draw the intro box
function DrawIntro(Intro, CurrentStagePosition, LoveLevel, SubLevel) {

	// Draw the top box and stats
	DrawRect(0, 0, 599, 150, "White");
	if (CurrentActor != "") {
		DrawRect(30, 60, 539, 1, "Black");
		DrawActorStats(300, 15);
	}

	// Find the correct intro text
	var ShowText = "";
	if (OverridenIntroText != "")
		ShowText = OverridenIntroText
	else
		for (var I = 0; I < Intro.length; I++)
			if (Intro[I][IntroStage] == CurrentStagePosition)
				if (ActorInteractionAvailable(Intro[I][IntroLoveReq], Intro[I][IntroSubReq], Intro[I][IntroVarReq], Intro[I][IntroText], true))
					ShowText = Intro[I][IntroText];

	// Draw the intro
	if (CurrentActor != "") DrawText(ShowText, 300, 105, "black");
	else DrawText(ShowText, 300, 75, "black");

}

// Draw a selectable option on the screen
function DrawOption(OptionText, Left, Top) {

	// Draw the rectangle and text
	if (OptionText.substr(0, 1) == "@") OptionText = OptionText.substr(1);
	DrawRect(Left, Top, 299, 89, "White");
	if ((MouseX >= Left) && (MouseX <= Left + 299) && (MouseY >= Top) && (MouseY <= Top + 89) && !IsMobile) DrawText(OptionText, Left + 150, Top + 45, "#00BB00");
	else DrawText(OptionText, Left + 150, Top + 45, "#BB0000");

}

// Draw all the possible interactions
function DrawInteraction(Stage, CurrentStagePosition, LoveLevel, SubLevel) {

	// Find all the correct interactions for the current stage
	var Pos = 0;
	for (var S = 0; S < Stage.length; S++)
		if (Stage[S][StageNumber] == CurrentStagePosition)
			if (ActorInteractionAvailable(Stage[S][StageLoveReq], Stage[S][StageSubReq], Stage[S][StageVarReq], Stage[S][StageInteractionText], false)) {

				// Draw the box and interaction
				DrawOption(Stage[S][StageInteractionText], (Pos % 2) * 300, 151 + (Math.round((Pos - 1) / 2) * 90));
				Pos = Pos + 1;

			}

}

// Find the current image file
function FindImage(Intro, CurrentStagePosition) {

	// The image file is a column in the intro CSV file
	var ImageName = "";
	if (OverridenIntroImage != "")
		ImageName = OverridenIntroImage;
	else
		for (var I = 0; I < Intro.length; I++)
			if (Intro[I][IntroStage] == CurrentStagePosition)
				if (ActorInteractionAvailable(Intro[I][IntroLoveReq], Intro[I][IntroSubReq], Intro[I][IntroVarReq], Intro[I][IntroText], true))
					ImageName = Intro[I][IntroImage];
	return ImageName;

}

// Build the full character / object interaction screen
function BuildInteraction(CurrentStagePosition) {

	// Make sure the CSV files for interactions are loaded
	if ((CurrentIntro != null) && (CurrentStage != null)) {

		// Paints the background image depending on the current stage
		var ImageName = FindImage(CurrentIntro, CurrentStagePosition);
		if ((ImageName !== undefined) && (ImageName.trim() != "")) DrawImage(CurrentChapter + "/" + CurrentScreen + "/" + ImageName, 600, 0);

		// Build all the options for interaction
		DrawRect(0, 0, 600, 600, "Black");
		DrawIntro(CurrentIntro, CurrentStagePosition, 0, 0);
		DrawInteraction(CurrentStage, CurrentStagePosition, 0, 0);

	}

}

// Get the player image file name
function GetPlayerIconImage() {

	// The file name changes if the player is gagged or blinks at specified intervals
	var Image = "Player";
	var seconds = new Date().getTime();
	if (PlayerHasLockedInventory("BallGag") == true) Image = Image + "_BallGag";
    if (PlayerHasLockedInventory("TapeGag") == true) Image = Image + "_TapeGag";
    if (PlayerHasLockedInventory("ClothGag") == true) Image = Image + "_ClothGag";
    if (PlayerHasLockedInventory("DoubleOpenGag") == true) Image = Image + "_DoubleOpenGag";
    if (PlayerHasLockedInventory("Blindfold") == true) Image = Image + "_Blindfold";
	if (Math.round(seconds / 500) % 15 == 0) Image = Image + "_Blink";
	return Image;

}

// Draw all the inventory icons
function DrawInventory() {

	// Draw the player icon
	if (((MouseX >= 1) && (MouseX <= 74) && (MouseY >= 601) && (MouseY <= 674)) || (IsMobile))
		DrawImage("Icons/" + GetPlayerIconImage() + "_Active.png", 0, 601);
	else
		DrawImage("Icons/" + GetPlayerIconImage() + "_Inactive.png", 0, 601);

	// Draw an arrow over the player head if there's a skill level up
	if (PlayerSkillShowLevelUp > 0) DrawImage("Icons/SkillLevelUp.png", 0, 601);

	// Scroll in the full inventory to draw the icons and quantity, draw a padlock over the item if it's locked
	var Pos = 1;
	for (var I = 0; I < PlayerInventory.length; I++) {

		// First inventory tab
		if (PlayerInventoryTab == 0) {

			// 11 positions for the items
			if (Pos <= 11) {
				var ImgState = "Inactive";
				if (((MouseX >= 1 + Pos * 75) && (MouseX <= 74 + Pos * 75) && (MouseY >= 601) && (MouseY <= 674)) || (IsMobile)) ImgState = "Active";
				DrawImage("Icons/" + PlayerInventory[I][PlayerInventoryName] + "_" + ImgState + ".png", 1 + Pos * 75, 601);
				DrawText(PlayerInventory[I][PlayerInventoryQuantity].toString(), Pos * 75 + 64, 661, "#000000");
				if (PlayerHasLockedInventory(PlayerInventory[I][PlayerInventoryName]))
					DrawImage("Icons/Lock_" + ImgState + ".png", Pos * 75, 600)
			}

			// the last position is for the next tab
			if (Pos == 12) {
				var ImgState = "Inactive";
				if (((MouseX >= 1 + Pos * 75) && (MouseX <= 74 + Pos * 75) && (MouseY >= 601) && (MouseY <= 674)) || (IsMobile)) ImgState = "Active";
				DrawImage("Icons/SecondInventoryTab_" + ImgState + ".png", 1 + Pos * 75, 601);
			}

		};

		// Second inventory tab
		if ((Pos >= 12) && (PlayerInventoryTab == 1)) {
			var ImgState = "Inactive";
			if (((MouseX >= 1 + (Pos - 11) * 75) && (MouseX <= 74 + (Pos - 11) * 75) && (MouseY >= 601) && (MouseY <= 674)) || (IsMobile)) ImgState = "Active";
			DrawImage("Icons/" + PlayerInventory[I][PlayerInventoryName] + "_" + ImgState + ".png", 1 + (Pos - 11) * 75, 601);
			DrawText(PlayerInventory[I][PlayerInventoryQuantity].toString(), (Pos - 11) * 75 + 64, 661, "#000000");
			if (PlayerHasLockedInventory(PlayerInventory[I][PlayerInventoryName]))
				DrawImage("Icons/Lock_" + ImgState + ".png", (Pos - 11) * 75, 600)
		};

		// Jumps to the next position
		Pos = Pos + 1;

	}

	// Scroll in the locked inventory also to find items that were not loaded
	for (var I = 0; I < PlayerLockedInventory.length; I++)
		if (!PlayerHasInventory(PlayerLockedInventory[I])) {

			// First inventory tab
			if (PlayerInventoryTab == 0) {

				// 11 positions for the items
				if (Pos <= 11) {
					if (((MouseX >= 1 + Pos * 75) && (MouseX <= 74 + Pos * 75) && (MouseY >= 601) && (MouseY <= 674)) || (IsMobile)) {
						DrawImage("Icons/" + PlayerLockedInventory[I] + "_Active.png", 1 + Pos * 75, 601);
						DrawImage("Icons/Lock_Active.png", Pos * 75, 600);
					}
					else {
						DrawImage("Icons/" + PlayerLockedInventory[I] + "_Inactive.png", 1 + Pos * 75, 601);
						DrawImage("Icons/Lock_Inactive.png", Pos * 75, 600);
					}
				}

				// the last position is for the next tab
				if (Pos == 12) {
					var ImgState = "Inactive";
					if (((MouseX >= 1 + Pos * 75) && (MouseX <= 74 + Pos * 75) && (MouseY >= 601) && (MouseY <= 674)) || (IsMobile)) ImgState = "Active";
					DrawImage("Icons/SecondInventoryTab_" + ImgState + ".png", 1 + Pos * 75, 601);
				}

			}

			// Second inventory tab
			if ((Pos >= 12) && (PlayerInventoryTab == 1)) {
				if (((MouseX >= 1 + (Pos - 11) * 75) && (MouseX <= 74 + (Pos - 11) * 75) && (MouseY >= 601) && (MouseY <= 674)) || (IsMobile)) {
					DrawImage("Icons/" + PlayerLockedInventory[I] + "_Active.png", 1 + (Pos - 11) * 75, 601);
					DrawImage("Icons/Lock_Active.png", (Pos - 11) * 75, 600);
				}
				else {
					DrawImage("Icons/" + PlayerLockedInventory[I] + "_Inactive.png", 1 + (Pos - 11) * 75, 601);
					DrawImage("Icons/Lock_Inactive.png", (Pos - 11) * 75, 600);
				}
			};

			// Jumps to the next position
			Pos = Pos + 1;

		};

	// On the second tab, we put an arrow to go back to the first tab
	if ((Pos >= 12) && (PlayerInventoryTab == 1)) {
		var ImgState = "Inactive";
		if (((MouseX >= 1 + (Pos - 11) * 75) && (MouseX <= 74 + (Pos - 11) * 75) && (MouseY >= 601) && (MouseY <= 674)) || (IsMobile)) ImgState = "Active";
		DrawImage("Icons/FirstInventoryTab_" + ImgState + ".png", 1 + (Pos - 11) * 75, 601);
	}

}

// Build the bottom bar menu
function BuildBottomBar() {

	// Paints the background depending on the current stage
	DrawRect(0, 600, 1200, 1, "black");
	DrawRect(0, 601, 1200, 74, "white");
	DrawRect(975, 600, 1, 675, "black");
	DrawInventory();

	// Draw the leave icon and clock
	if (LeaveIcon != "") {
		DrawImage("Icons/Clock.png", 985, 621);
		DrawText(msToTime(CurrentTime), 1073, 637, "black");
		if (((MouseX >= 1125) && (MouseX <= 1200) && (MouseY >= 600) && (MouseY <= 675)) || (IsMobile)) DrawImage("Icons/" + LeaveIcon + "_Active.png", 1125, 600);
		else DrawImage("Icons/" + LeaveIcon + "_Inactive.png", 1125, 600);
	} else {
		DrawImage("Icons/Clock.png", 1010, 621);
		DrawText(msToTime(CurrentTime), 1110, 637, "black");
	}

}

// Returns the name of the image file to use to draw the player
function DrawGetPlayerImageName(IncludePose) {

	// Get the first part of the image
	var ImageCloth = "Clothed";
	if (Common_PlayerUnderwear) ImageCloth = "Underwear";
	if (Common_PlayerNaked) ImageCloth = "Naked";
	if ((Common_PlayerUnderwear || Common_PlayerNaked) && PlayerHasLockedInventory("ChastityBelt")) ImageCloth = "ChastityBelt";
	if (Common_PlayerCostume != "") ImageCloth = Common_PlayerCostume

	// Second part is the type of bondage
	var ImageBondage = "_NoBondage";
	if (PlayerHasLockedInventory("Cuffs") == true) ImageBondage = "_Cuffs";
	if (PlayerHasLockedInventory("Rope") == true) ImageBondage = "_Rope";
	if (PlayerHasLockedInventory("Armbinder") == true) ImageBondage = "_Armbinder";

	// Third part is the collar, which only shows for certain clothes
	var ImageCollar = "";
	if ((ImageCloth == "Underwear") || (ImageCloth == "Naked") || (ImageCloth == "ChastityBelt") || (ImageCloth == "Damsel") || (ImageCloth == "Tennis") || (ImageCloth == "Judo") || (ImageCloth == "RedBikini")) {
		if (PlayerHasLockedInventory("Collar")) ImageCollar = "_Collar";
		else ImageCollar = "_NoCollar";
	}

	// Fourth part is the gag
	var ImageGag = "_NoGag";
	if (PlayerHasLockedInventory("BallGag") == true) ImageGag = "_BallGag";
    if (PlayerHasLockedInventory("TapeGag") == true) ImageGag = "_TapeGag";
    if (PlayerHasLockedInventory("ClothGag") == true) ImageGag = "_ClothGag";
    if (PlayerHasLockedInventory("DoubleOpenGag") == true) ImageGag = "_DoubleOpenGag";

	// Fifth part is the blindfold
	var ImageBlindfold = "";
    if (PlayerHasLockedInventory("Blindfold") == true) ImageBlindfold = "_Blindfold";

	// Sixth part is the pose
	var ImagePose = "";
    if ((Common_PlayerPose != "") && IncludePose) ImagePose = "_" + Common_PlayerPose;

	// Return the constructed name
	return ImageCloth + ImageBondage + ImageCollar + ImageGag + ImageBlindfold + ImagePose;

}

// Draw the regular player image (600x600) (can zoom if an X and Y are provided)
function DrawPlayerImage(X, Y) {
	if ((Common_PlayerCostume == "Tennis") || (Common_PlayerCostume == "Judo") || (Common_PlayerCostume == "Teacher") || (Common_PlayerCostume == "BlackDress") || (Common_PlayerCostume == "WhiteLingerie") || (Common_PlayerCostume == "RedBikini")) {
		DrawRect(600, 0, 1200, 600, "White");
		DrawTransparentPlayerImage(600, 0, 1);
	} else {
		if ((X == 0) && (Y == 0)) DrawImage("C999_Common/Player/" + DrawGetPlayerImageName(false) + ".jpg", 600, 0);
		else DrawImageZoom("C999_Common/Player/" + DrawGetPlayerImageName(false) + ".jpg", X, Y, 600, 600, 600, 0, 1200, 1200);
	}
}

// Draw the transparent player image (600x900) with a zoom if required
function DrawTransparentPlayerImage(X, Y, Zoom) {
	DrawImageZoom("Actors/Player/" + DrawGetPlayerImageName(true) + ".png", 0, 0, 600, 900, X, Y, 600 * Zoom, 900 * Zoom);
}

// Draw the transparent actor over the current background
function DrawActor(ActorToDraw, X, Y, Zoom) {

	// Validate first if we must draw the transparent player image
	if (ActorToDraw == "Player") {
		DrawTransparentPlayerImage(X, Y, Zoom);
	} else {

		// First, we retrieve the current clothes
		var ImageCloth = ActorSpecificGetValue(ActorToDraw, ActorCloth);
		if (ImageCloth == "") ImageCloth = "Clothed";
		if (((ImageCloth == "Underwear") || (ImageCloth == "Naked")) && ActorSpecificHasInventory(ActorToDraw, "ChastityBelt")) ImageCloth = "ChastityBelt";

		// Second part is the type of bondage
		var ImageBondage = "_NoBondage";
		if (ActorSpecificHasInventory(ActorToDraw, "Cuffs")) ImageBondage = "_Cuffs";
		if (ActorSpecificHasInventory(ActorToDraw, "Rope")) ImageBondage = "_Rope";
		if (ActorSpecificHasInventory(ActorToDraw, "TwoRopes")) ImageBondage = "_TwoRopes";
		if (ActorSpecificHasInventory(ActorToDraw, "ThreeRopes")) ImageBondage = "_ThreeRopes";
		if (ActorSpecificHasInventory(ActorToDraw, "Armbinder")) ImageBondage = "_Armbinder";

		// Third part is the collar, which only shows for certain clothes
		var ImageCollar = "";
		if ((ImageCloth == "Underwear") || (ImageCloth == "Naked") || (ImageCloth == "ChastityBelt") || (ImageCloth == "Damsel") || (ImageCloth == "Shorts") || (ImageCloth == "Swimsuit") || (ImageCloth == "Tennis") || (ImageCloth == "BrownDress")) {
			if (ActorSpecificHasInventory(ActorToDraw, "Collar")) ImageCollar = "_Collar";
		}

		// Fourth part is the gag
		var ImageGag = "_NoGag";
		if (ActorSpecificHasInventory(ActorToDraw, "BallGag")) ImageGag = "_BallGag";
		if (ActorSpecificHasInventory(ActorToDraw, "TapeGag")) ImageGag = "_TapeGag";
		if (ActorSpecificHasInventory(ActorToDraw, "ClothGag")) ImageGag = "_ClothGag";

		// Fifth part is the blindfold
		var ImageBlindfold = "";
		if (ActorSpecificHasInventory(ActorToDraw, "Blindfold")) ImageBlindfold = "_Blindfold";

		// Fourth part is the pose
		var ImagePose = "";
		if (ActorSpecificGetValue(ActorToDraw, ActorPose) != "") ImagePose = "_" + ActorSpecificGetValue(ActorToDraw, ActorPose);

		// Draw the full image from all parts
		DrawImageZoom("Actors/" + ActorToDraw + "/" + ImageCloth + ImageBondage + ImageCollar + ImageGag + ImageBlindfold + ImagePose + ".png", 0, 0, 600, 900, X, Y, 600 * Zoom, 900 * Zoom);

	}

}

// Draw the current interaction actor (if there's no actor, we draw the player)
function DrawInteractionActor() {
	if (CurrentActor == "") {
		DrawTransparentPlayerImage(600, 0, 1);
	} else {
		if (ActorHasInventory("TwoRopes") || ActorHasInventory("ThreeRopes")) DrawActor(CurrentActor, 600, -250, 1);
		else DrawActor(CurrentActor, 600, 0, 1);
	}
}

// Draw a ramdom image of the player as transition from chapter to chapter
function DrawPlayerTransition() {
	var ImgRnd = (Math.round(new Date().getTime() / 5000) % 8) + 1;
	DrawImage("Actors/PlayerTransition/Player0" + ImgRnd.toString() + ".png", 900, 0);
}

// Returns a the path to a icon.  IconName can be preceeded by additional paths.
function GetIconPath(IconName) {
    return GetPath.apply(undefined, arguments) + ".png";
}

// Returns a the path to an icon for the current screen.  IconName can be preceeded by additional paths.
function GetIconScreenPath(IconName) {
    return GetIconPath(GetPath.apply(undefined, [CurrentChapter, CurrentScreen].concat(Array.from(arguments))));
}


//===========================
// EVENTS.JS
//===========================

var EventLastRandomType = "";
var EventActivityCurrent = "";
var EventActivityCount = 0;
var EventActivityMaxCount = 0;
var EventList = ["Naked", "Underwear", "SchoolUniform", "RedBikini", "BlackDress", "WhiteLingerie", "Tennis", "FullBondage", "BondageHug", "Restrain", "Gag", "Release", "ConfiscateKeys", "ConfiscateCrop", "VibratingEgg", "Tickle", "Slap", "Masturbate", "Crop", "PushUp", "SitUp"];
var EventPunishmentList = ["Grounded", "Belted", "Spanked", "SleepBoundAndGagged", "Humiliated"];

// Returns TRUE if the event is accepted
function EventRandomChance(EventChanceModifier) {

	// Odds are 50% by default and we can add a modifier based on love/sub levels
	var EventChance = Math.floor(Math.random() * 100);
	if (EventChanceModifier == "Love") EventChance = EventChance + ActorGetValue(ActorLove);
	if (EventChanceModifier == "Hate") EventChance = EventChance - ActorGetValue(ActorLove);
	if (EventChanceModifier == "Dom") EventChance = EventChance + ActorGetValue(ActorSubmission);
	if (EventChanceModifier == "Sub") EventChance = EventChance - ActorGetValue(ActorSubmission);
	return (EventChance >= 50);

}

// Apply a submissive event on the player
function EventPlayerSubmissive(EventType) {
	OverridenIntroText = "";
	LeaveIcon = "";
	return parseInt(EventType);
}

// Sets the timer for the next generic event, the next one will be available between 5 and 10 minutes, the next forced one will be between 20 and 40 minutes
function EventSetGenericTimer() {
	GameLogAddTimer("EventGeneric", CurrentTime + 300000 + Math.floor(Math.random() * 300000));
	GameLogAddTimer("EventGenericNext", CurrentTime + 1200000 + Math.floor(Math.random() * 1200000));
}


// Draws a punishment event for the player at random
function EventRandomPlayerPunishment() {

	// Until we find a proper event
	OverridenIntroText = "";
	var Result = 0;
	while (Result == 0) {

		// Draw a punishment type at random
		var PunishmentType = EventPunishmentList[Math.floor(Math.random() * EventPunishmentList.length)];

		// If the event is valid for that actor
		var PunishmentStage = GetText("Punishment" + PunishmentType);
		if (IsNumeric(PunishmentStage)) {

			// Check if the event can be done
			if (PunishmentType == "Grounded") Result = parseInt(PunishmentStage);
			if ((PunishmentType == "Spanked") && !GameLogQuery(CurrentChapter, "", "EventSpanked")) Result = parseInt(PunishmentStage);
			if ((PunishmentType == "Belted") && !Common_PlayerChaste && PlayerHasInventory("ChastityBelt")) Result = parseInt(PunishmentStage);
			if ((PunishmentType == "SleepBoundAndGagged") && !GameLogQuery(CurrentChapter, "", "EventSleepBoundAndGagged")) Result = parseInt(PunishmentStage);
			if ((PunishmentType == "Humiliated") && !GameLogQuery(CurrentChapter, "", "EventHumiliated")) Result = parseInt(PunishmentStage);

		}

	}

	// Returns the punishment type which will become the dialog number
	return Result;

}

// Draws a submissive event for the player at random (Launch from a Mistress Actor)
function EventRandomPlayerSubmissive() {

	// Until we find a proper event
	var Result = 0;
	while (Result == 0) {

		// Draw an event type at random, make sure it doesn't repeat
		var EventType = EventLastRandomType;
		while (EventType == EventLastRandomType)
			EventType = EventList[Math.floor(Math.random() * EventList.length)];

		// If the event is valid for that actor
		var EventStage = GetText("Event" + EventType);
		if (IsNumeric(EventStage)) {

			// Most event have requirements to work
			if ((EventType == "Naked") && !Common_PlayerRestrained && !Common_PlayerNaked) Result = EventPlayerSubmissive(EventStage);
			if ((EventType == "Underwear") && !Common_PlayerRestrained && !Common_PlayerUnderwear && !Common_PlayerChaste) Result = EventPlayerSubmissive(EventStage);
			if ((EventType == "SchoolUniform") && !Common_PlayerRestrained && (!Common_PlayerClothed || (Common_PlayerCostume != ""))) Result = EventPlayerSubmissive(EventStage);
			if ((EventType == "RedBikini") && !Common_PlayerRestrained && (Common_PlayerCostume != "RedBikini") && !Common_PlayerChaste) Result = EventPlayerSubmissive(EventStage);
			if ((EventType == "WhiteLingerie") && !Common_PlayerRestrained && (Common_PlayerCostume != "WhiteLingerie") && !Common_PlayerChaste) Result = EventPlayerSubmissive(EventStage);
			if ((EventType == "BlackDress") && !Common_PlayerRestrained && (Common_PlayerCostume != "BlackDress")) Result = EventPlayerSubmissive(EventStage);
			if ((EventType == "Tennis") && !Common_PlayerRestrained && (Common_PlayerCostume != "Tennis") && ((GameLogQuery("C007_LunchBreak", "Jennifer", "Lunch") || GameLogQuery("C012_AfterClass", "Jennifer", "Running")))) Result = EventPlayerSubmissive(EventStage);
			if ((EventType == "FullBondage") && !Common_PlayerRestrained && !Common_PlayerGagged) Result = EventPlayerSubmissive(EventStage);
			if ((EventType == "Restrain") && !Common_PlayerRestrained) Result = EventPlayerSubmissive(EventStage);
			if ((EventType == "Gag") && !Common_PlayerGagged) Result = EventPlayerSubmissive(EventStage);
			if ((EventType == "Release") && Common_PlayerRestrained) { Result = EventPlayerSubmissive(EventStage); PlayerReleaseBondage(); }
			if ((EventType == "VibratingEgg") && PlayerHasInventory("VibratingEgg") && !PlayerHasLockedInventory("VibratingEgg") && !Common_PlayerChaste) Result = EventPlayerSubmissive(EventStage);
			if ((EventType == "ConfiscateKeys") && PlayerHasInventory("CuffsKey")) Result = EventPlayerSubmissive(EventStage);
			if ((EventType == "ConfiscateCrop") && PlayerHasInventory("Crop")) Result = EventPlayerSubmissive(EventStage);
			if (EventType == "BondageHug") Result = EventPlayerSubmissive(EventStage);
			if (EventType == "Tickle") Result = EventPlayerSubmissive(EventStage);
			if (EventType == "Slap") Result = EventPlayerSubmissive(EventStage);
			if ((EventType == "Masturbate") && !Common_PlayerChaste && !GameLogQuery(CurrentChapter, "Player", "NextPossibleOrgasm")) Result = EventPlayerSubmissive(EventStage);
			if ((EventType == "Crop") && (PlayerHasInventory("Crop") || GameLogQuery("", Common_PlayerOwner, "HasCrop"))) Result = EventPlayerSubmissive(EventStage);
			if ((EventType == "PushUp") && !Common_PlayerRestrained && !Common_PlayerGagged && !Common_PlayerChaste) Result = EventPlayerSubmissive(EventStage);
			if ((EventType == "SitUp") && !Common_PlayerRestrained && !Common_PlayerGagged && !Common_PlayerChaste) Result = EventPlayerSubmissive(EventStage);

		}

	}

	// Returns the event type which will become the dialog number
	EventLastRandomType = EventType;
	return Result;

}

// Log the end of an event, if it's the first time, it can change the actor attitude
function EventLogEnd() {
	if (!GameLogQuery(CurrentChapter, CurrentActor, "Activity" + EventActivityCurrent)) {
		if (EventActivityLove > 0) ActorChangeAttitude(1, 0);
		if (EventActivityLove < 0) ActorChangeAttitude(-1, 0);
		GameLogAdd("Activity" + EventActivityCurrent);
	}
	EventActivityCurrent = "";
}


// When an activity event is registered
function EventDoActivity(EventActivityType, EventLoveFactor, EventCurrentStage, EventEndStage, EventBonusStage) {

	// If it's a new activity
	if (EventActivityCurrent != EventActivityType) {

		// Reset the count and sets the pose
		ActorSetPose(EventActivityType);
		EventActivityCurrent = EventActivityType;
		EventActivityCount = 0;
		EventActivityLove = 0;

		// The number of times the activity will be done depends on the love or hate
		if ((EventActivityType == "Tickle") || (EventActivityType == "Masturbate")) EventActivityMaxCount = 5 + Math.floor(ActorGetValue(ActorLove) / 10);
		else EventActivityMaxCount = 5 - Math.floor(ActorGetValue(ActorLove) / 10);
		if (EventActivityMaxCount < 4) EventActivityMaxCount = 4;
		if (EventActivityMaxCount > 8) EventActivityMaxCount = 8;

	}

	// Increments the activity
	EventActivityCount++;
	EventActivityLove = EventActivityLove + EventLoveFactor;

	// If a bonus event can be achieved
	if ((EventActivityCount >= 3) && (EventBonusStage > 0)) {

		// 20% bonus chance (+20% if masturbated with an egg)
		var BonusChance = Math.floor(Math.random() * 100);
		if ((EventActivityType == "Masturbate") && PlayerHasLockedInventory("VibratingEgg")) BonusChance = BonusChance + 20;

		// If we have the bonus, we log and jump to that stage
		if (BonusChance >= 80) {
			EventLogEnd();
			OverridenIntroText = "";
			return EventBonusStage;
		}

	}

	// When the activity is over
	if (EventActivityCount >= EventActivityMaxCount) {

		// Log the activity and ends it
		EventLogEnd()
		if (EventActivityLove > 0) OverridenIntroText = GetText("ActivityEndGood");
		if (EventActivityLove == 0) OverridenIntroText = GetText("ActivityEndFair");
		if (EventActivityLove < 0) OverridenIntroText = GetText("ActivityEndBad");
		ActorSetPose("");
		return EventEndStage;

	}

	// FALSE means the activity isn't over
	return EventCurrentStage;

}


//===========================
// GAMELOG
//===========================

var GameLog = [];
var GameLogChapter = 0;
var GameLogActor = 1;
var GameLogEvent = 2;
var GameLogTimer = 3;

// Log a specific event that happened in the game to be consulted by other scripts afterward
function GameLogSpecificAdd(ChapterToLog, ActorToLog, EventToLog) {

	// If no actor is specified, we imply the player
	if (ActorToLog == "") ActorToLog = "Player";

	// Do not log the same event twice
	for (var L = 0; L < GameLog.length; L++)
		if ((ChapterToLog == GameLog[L][GameLogChapter]) && (ActorToLog == GameLog[L][GameLogActor]) && (EventToLog == GameLog[L][GameLogEvent]))
			return;

	// Log the event
	GameLog[GameLog.length] = [ChapterToLog, ActorToLog, EventToLog, 0];

}

// Log a specific event that happened in the game with a timer to be used in the game later
function GameLogSpecificAddTimer(ChapterToLog, ActorToLog, EventToLog, TimerToLog) {

	// If no actor is specified, we imply the player
	if (ActorToLog == "") ActorToLog = "Player";

	// Do not log the same event twice, replace the timer
	for (var L = 0; L < GameLog.length; L++)
		if ((ChapterToLog == GameLog[L][GameLogChapter]) && (ActorToLog == GameLog[L][GameLogActor]) && (EventToLog == GameLog[L][GameLogEvent])) {
			GameLog[L] = [ChapterToLog, ActorToLog, EventToLog, TimerToLog];
			return;
		}

	// Log the event with it's timer
	GameLog[GameLog.length] = [ChapterToLog, ActorToLog, EventToLog, TimerToLog];

}

// Flush a specific event from the log
function GameLogSpecificDelete(ChapterToDelete, ActorToDelete, EventToDelete) {
	for (var L = 0; L < GameLog.length; L++)
		if ((ChapterToDelete == GameLog[L][GameLogChapter]) && (ActorToDelete == GameLog[L][GameLogActor]) && (EventToDelete == GameLog[L][GameLogEvent]))
			GameLog.splice(L, 1);
}

// Log a specific event for the current chapter and actor, to be consulted by other scripts afterward
function GameLogAdd(EventToLog) {
	GameLogSpecificAdd(CurrentChapter, CurrentActor, EventToLog);
}

// Log a specific event that happened in the game with a timer to be used in the game later (negative timer means we flush the log)
function GameLogAddTimer(EventToLog, TimerToLog) {
	if (TimerToLog >= 0)
		GameLogSpecificAddTimer(CurrentChapter, CurrentActor, EventToLog, TimerToLog);
	else
		GameLogSpecificDelete(CurrentChapter, CurrentActor, EventToLog);
}

// Returns TRUE if the event happened based on the query parameters, none of them are mandatory, the timer must be still valid at game time, it acts an expiry date
function GameLogQuery(ChapterToQuery, ActorToQuery, EventToQuery) {

	// Scan the log based on the query parameters, returns TRUE if all parameters are a match
	for (var L = 0; L < GameLog.length; L++)
		if ((ChapterToQuery == "") || (ChapterToQuery == GameLog[L][GameLogChapter]))
			if ((ActorToQuery == "") || (ActorToQuery == GameLog[L][GameLogActor]))
				if ((EventToQuery == "") || (EventToQuery == GameLog[L][GameLogEvent]))
					if ((GameLog[L][GameLogTimer] == 0) || (CurrentTime < GameLog[L][GameLogTimer]))
						return true;

	// Since the queried event wasn't found, we return FALSE
	return false;

}


//===========================
// INVENTORY.JS
//===========================

var PlayerInventory = [];
var PlayerInventoryName = 0;
var PlayerInventoryQuantity = 1;
var PlayerLockedInventory = [];
var PlayerSavedInventory = [];
var PlayerInventoryTab = 0;

// Set up the player clothes or costume
function PlayerClothes(NewCloth) {
	if ((NewCloth != "Clothed") && (NewCloth != "Underwear") && (NewCloth != "Naked")) Common_PlayerCostume = NewCloth;
	else Common_PlayerCostume = "";
	Common_PlayerCloth = NewCloth;
	Common_PlayerUnderwear = (NewCloth == "Underwear");
	Common_PlayerNaked = (NewCloth == "Naked");
	Common_PlayerClothed = (!Common_PlayerUnderwear && !Common_PlayerNaked);
}

// Set the restrained and gagged common variables, used by many scenes
function LoadRestrainStatus() {
	Common_PlayerRestrained = (PlayerHasLockedInventory("Cuffs") || PlayerHasLockedInventory("Rope") || PlayerHasLockedInventory("Armbinder") || PlayerHasLockedInventory("Manacles"));
	Common_PlayerGagged = (PlayerHasLockedInventory("BallGag") || PlayerHasLockedInventory("TapeGag") || PlayerHasLockedInventory("ClothGag") || PlayerHasLockedInventory("PantieGag") || PlayerHasLockedInventory("SockGag") || PlayerHasLockedInventory("DoubleOpenGag"));
	Common_PlayerChaste = PlayerHasLockedInventory("ChastityBelt");
	Common_PlayerNotRestrained = !Common_PlayerRestrained;
	Common_PlayerNotGagged = !Common_PlayerGagged;
}

// Save the current full inventory for the player
function PlayerSaveAllInventory() {
	PlayerSavedInventory = PlayerInventory.slice();
}

// Restore the full saved inventory for the player, one item by item
function PlayerRestoreAllInventory() {
	for (var I = 0; I < PlayerSavedInventory.length; I++)
		PlayerAddInventory(PlayerSavedInventory[I][PlayerInventoryName], PlayerSavedInventory[I][PlayerInventoryQuantity]);
	PlayerSavedInventory = [];
}

// Add a new item to the locked inventory
function PlayerLockInventory(NewInventory) {

	// Check if the item is already locked before adding it
	for (var I = 0; I < PlayerLockedInventory.length; I++)
		if (PlayerLockedInventory[I] == NewInventory)
			return;
	PlayerLockedInventory.push(NewInventory);
	LoadRestrainStatus();

	// If there's rope/armbinder and a costume, we strip the player
	if (((NewInventory == "Rope") || (NewInventory == "Armbinder")) && (Common_PlayerCostume != "") && (Common_PlayerCostume != "BlackDress") && (Common_PlayerCostume != "WhiteLingerie") && (Common_PlayerCostume != "RedBikini")) PlayerClothes("Underwear");

}

// Remove an item from the locked inventory
function PlayerUnlockInventory(UnlockedInventory) {

	// Check if the item is already locked before adding it
	for (var I = 0; I < PlayerLockedInventory.length; I++)
		if (PlayerLockedInventory[I] == UnlockedInventory)
			PlayerLockedInventory.splice(I, 1);
	LoadRestrainStatus();

}

// Remove all items from the locked inventory except the egg, plug, collar and chastity belt
function PlayerUnlockAllInventory(UnlockedInventory) {
	var HadCollar = PlayerHasLockedInventory("Collar");
	var HadEgg = PlayerHasLockedInventory("VibratingEgg");
	var HadPlug = PlayerHasLockedInventory("ButtPlug");
	var HadBelt = PlayerHasLockedInventory("ChastityBelt");
	while (PlayerLockedInventory.length > 0)
		PlayerLockedInventory.splice(0, 1);
	if (HadCollar) PlayerLockInventory("Collar");
	if (HadEgg) PlayerLockInventory("VibratingEgg");
	if (HadPlug) PlayerLockInventory("ButtPlug");
	if (HadBelt) PlayerLockInventory("ChastityBelt");
	LoadRestrainStatus();
}

// Returns true if the player has the locked inventory
function PlayerHasLockedInventory(QueryInventory) {

	// Returns true if we find the locked inventory item
	for (var I = 0; I < PlayerLockedInventory.length; I++)
		if (QueryInventory == PlayerLockedInventory[I])
			return true;
	return false;

}

// Add a new item to the inventory if it's not already there
function PlayerAddInventory(NewInventory, NewQuantity) {

	// If inventory already exists, we add 1 quantity
	for (var I = 0; I < PlayerInventory.length; I++)
		if (NewInventory == PlayerInventory[I][PlayerInventoryName]) {
			PlayerInventory[I][PlayerInventoryQuantity] = PlayerInventory[I][PlayerInventoryQuantity] + NewQuantity;
			if (PlayerInventory[I][PlayerInventoryQuantity] > 99) PlayerInventory[I][PlayerInventoryQuantity] = 99;
			return;
		}

	// If not, we create the new inventory data
	if (NewQuantity > 99) NewQuantity = 99;
	PlayerInventory[PlayerInventory.length] = [NewInventory, NewQuantity];

}

// Remove an item from the player inventory
function PlayerRemoveInventory(RemInventory, RemQuantity) {

	// Search for current inventory and remove the item
	for (var I = 0; I < PlayerInventory.length; I++)
		if (RemInventory == PlayerInventory[I][PlayerInventoryName])
			if (RemQuantity >= PlayerInventory[I][PlayerInventoryQuantity])
				PlayerInventory.splice(I, 1);
			else
				PlayerInventory[I][PlayerInventoryQuantity] = PlayerInventory[I][PlayerInventoryQuantity] - RemQuantity;

}

// Remove all inventory from the player
function PlayerRemoveAllInventory() {
	while (PlayerInventory.length > 0)
		PlayerInventory.splice(0, 1);
}

// Remove half of the inventory from the player (rounded up)
function PlayerRemoveHalfInventory() {
	for (var I = 0; I < PlayerInventory.length; I++) {
		if (PlayerInventory[I][PlayerInventoryQuantity] <= 1) {
			PlayerInventory.splice(I, 1);
			I--;
		} else PlayerInventory[I][PlayerInventoryQuantity] = Math.floor(PlayerInventory[I][PlayerInventoryQuantity] / 2);
	}
}

// Returns true if the player has the queried inventory
function PlayerHasInventory(QueryInventory) {

	// Returns true if we find the inventory item
	for (var I = 0; I < PlayerInventory.length; I++)
		if (QueryInventory == PlayerInventory[I][PlayerInventoryName])
			return true;
	return false;

}

// Pick a random restrain and applies it on the player
function PlayerRandomRestrain() {

	// Selects the restrain type
	var R = "";
	if (!Common_PlayerRestrained) {
		var RT = [];
		if (PlayerHasInventory("Rope")) RT.push("Rope");
		if (PlayerHasInventory("Cuffs")) RT.push("Cuffs");
		if (PlayerHasInventory("Armbinder")) RT.push("Armbinder");
		if (PlayerHasInventory("Manacles")) RT.push("Manacles");
		if (RT.length > 0) R = RT[Math.floor(Math.random() * RT.length)];
	}

	// Applies it on the player
	if (R != "") { PlayerRemoveInventory(R, 1); PlayerLockInventory(R); }

}

// Pick a random gag and applies it on the player
function PlayerRandomGag() {

	// Selects the gag type
	var G = "";
	if (!Common_PlayerGagged) {
		var GT = [];
		if (PlayerHasInventory("BallGag")) GT.push("BallGag");
		if (PlayerHasInventory("TapeGag")) GT.push("TapeGag");
		if (PlayerHasInventory("ClothGag")) GT.push("ClothGag");
		if (GT.length > 0) G = GT[Math.floor(Math.random() * GT.length)];
	}

	// Applies it on the player
	if (G != "") { PlayerRemoveInventory(G, 1); PlayerLockInventory(G); }

}

// Restrains the player randomly from her own inventory
function PlayerRandomBondage() {
	PlayerRandomRestrain();
	PlayerRandomGag();
}

// Release the player from bondage and restore it's inventory
function PlayerReleaseBondage() {
	if (PlayerHasLockedInventory("Cuffs")) { PlayerUnlockInventory("Cuffs"); PlayerAddInventory("Cuffs", 1); }
	if (PlayerHasLockedInventory("Rope")) { PlayerUnlockInventory("Rope"); PlayerAddInventory("Rope", 1); }
	if (PlayerHasLockedInventory("Armbinder")) { PlayerUnlockInventory("Armbinder"); PlayerAddInventory("Armbinder", 1); }
	if (PlayerHasLockedInventory("Manacles")) PlayerUnlockInventory("Manacles");
	PlayerUngag();
}

// Ungag the player and restore it's inventory
function PlayerUngag() {
	if (PlayerHasLockedInventory("BallGag")) { PlayerUnlockInventory("BallGag"); PlayerAddInventory("BallGag", 1); }
	if (PlayerHasLockedInventory("ClothGag")) { PlayerUnlockInventory("ClothGag"); PlayerAddInventory("ClothGag", 1); }
	if (PlayerHasLockedInventory("TapeGag")) { PlayerUnlockInventory("TapeGag"); }
	if (PlayerHasLockedInventory("PantieGag")) { PlayerUnlockInventory("PantieGag"); PlayerAddInventory("PantieGag", 1); }
	if (PlayerHasLockedInventory("SockGag")) { PlayerUnlockInventory("SockGag"); PlayerAddInventory("SockGag", 1); }
}

// Add a random item in the player inventory
function PlayerAddRandomItem() {
	var ItemList = ["BallGag", "TapeGag", "ClothGag", "Cuffs", "Rope", "Armbinder", "ChastityBelt", "VibratingEgg", "Crop", "Collar", "SleepingPill"];
	var Item = ItemList[Math.floor(Math.random() * 11)];
	PlayerAddInventory(Item, 1);
	if (Item == "TapeGag") PlayerAddInventory(Item, 7); // For tape gag, add a bonus + 7 quantity
	if ((Item == "Cuffs") && (Math.floor(Math.random() * 2) == 1)) PlayerAddInventory("CuffsKey", 1); // For cuffs, can randomly add keys
}

// Returns the total quantity of items that the player has
function PlayerInventoryTotalQuantity() {
	var TotalQuantity = 0;
	for (var I = 0; I < PlayerInventory.length; I++)
		TotalQuantity = TotalQuantity + PlayerInventory[I][PlayerInventoryQuantity];
	return TotalQuantity;
}

// Returns the name of the inventory item that was clicked in the bottom menu
function GetClickedInventory() {

	// Returns the item name based on the position of the mouse
	var Inv = "";
	if ((MouseX <= 975) && (MouseY >= 601) && (MouseY <= 674)) {

		// Check if the player icon was clicked
		if ((MouseX >= 1) && (MouseX <= 74))
			Inv = "Player";

		// Check in the regular inventory
		var I;
		if (Inv == "")
			for (I = 0; I < PlayerInventory.length; I++)
				if ((MouseX >= 1 + (I + 1 - (PlayerInventoryTab * 11)) * 75) && (MouseX <= 74 + (I + 1 - (PlayerInventoryTab * 11)) * 75)) {
					if (MouseX < 900) Inv = PlayerInventory[I][PlayerInventoryName];
					else PlayerInventoryTab = 1;
				}

		// Check in the locked inventory
		if (Inv == "")
			for (var L = 0; L < PlayerLockedInventory.length; L++)
				if (!PlayerHasInventory(PlayerLockedInventory[L])) {
					if ((MouseX >= 1 + (I + 1 - (PlayerInventoryTab * 11)) * 75) && (MouseX <= 74 + (I + 1 - (PlayerInventoryTab * 11)) * 75)) {
						if (MouseX < 900) Inv = "Locked_" + PlayerLockedInventory[L];
						else PlayerInventoryTab = 1;
					}
					I++;
				}

		// If we must go back to the first tab (on the second, after the first item)
		if ((Inv == "") && (PlayerInventoryTab > 0))
			if ((MouseX >= 1 + (I + 1 - (PlayerInventoryTab * 11)) * 75) && (MouseX <= 74 + (I + 1 - (PlayerInventoryTab * 11)) * 75))
				PlayerInventoryTab = 0;

	}

	// Returns the inventory found
	return Inv;

}

// Regular event for inventory clicks, set the common scene for the item
function InventoryClick(Inv, LChapter, LScreen) {
	if (Inv != "") {
		SetScene("C999_Common", Inv.replace("Locked_", ""));
		LeaveChapter = LChapter;
		LeaveScreen = LScreen;
	}
}


//===========================
// SAVESTAGE.JS
//===========================

var SaveGameVersion = "12A";
var SaveChapter = "";
var SaveScreen = "";
var SaveMaxSlot = 9;

// Opens the save menu for a specific chapter
function SaveMenu(NextChapter, NextScreen) {
	SaveChapter = NextChapter;
	SaveScreen = NextScreen;
	SetScene("C999_Common", "GameSave");
}

// Returns the save state summary
function SaveStateGetSummary(SlotNumber) {

	// Fetch the data
	var SN = SlotNumber.toString();
	var Summary = "@" + GetText("NoSaveOnSlot") + " " + SN;
	if (localStorage.getItem("SaveGameVersion" + SN))
		if (localStorage.getItem("SaveGameVersion" + SN) == SaveGameVersion) {
			var SaveStatePlayerName = localStorage.getItem("Common_PlayerName" + SN);
			var SaveStateChapter = localStorage.getItem("CurrentChapter" + SN).substr(1, 3);
			var SaveStateDateTime = localStorage.getItem("SaveGameDateTime" + SN);
			while (SaveStateChapter.substr(0, 1) == "0")
				SaveStateChapter = SaveStateChapter.substr(1, 100);
			Summary = "@" + SaveStatePlayerName.substr(0, 10) + " - " + GetText("Chapter") + " " + SaveStateChapter + "|" + SaveStateDateTime;
		}

	// Returns the summary
	return Summary;

}

// Show some info on the slots to load or save
function SaveStateSlotSummary() {

	// If the current stage is loaded
	if ((CurrentStage != null) && (CurrentText != null))
		if (CurrentStage[1][StageInteractionText] == "@Slot 1") {

			// For each save slots, we load the summary
			var Slot = 1;
			while (Slot <= SaveMaxSlot) {
				CurrentStage[Slot][StageInteractionText] = SaveStateGetSummary(Slot);
				Slot++;
			}

		}

}

// Save the game state on a specific slot
function SaveState(SlotNumber) {

	// Save the current state of the game and the transitional variables
	var SN = SlotNumber.toString();
	localStorage.setItem("SaveGameVersion" + SN, SaveGameVersion);
	localStorage.setItem("SaveGameDateTime" + SN, GetFormatDate());
	localStorage.setItem("CurrentChapter" + SN, SaveChapter);
	localStorage.setItem("CurrentScreen" + SN, SaveScreen);
	localStorage.setItem("Common_PlayerName" + SN, Common_PlayerName);
	localStorage.setItem("Common_PlayerOwner" + SN, Common_PlayerOwner);
	localStorage.setItem("Common_PlayerLover" + SN, Common_PlayerLover);
	localStorage.setItem("Common_PlayerCloth" + SN, Common_PlayerCloth);
	localStorage.setItem("PlayerInventory" + SN, JSON.stringify(PlayerInventory));
	localStorage.setItem("PlayerLockedInventory" + SN, JSON.stringify(PlayerLockedInventory));
	localStorage.setItem("PlayerSkill" + SN, JSON.stringify(PlayerSkill));
	localStorage.setItem("Actor" + SN, JSON.stringify(Actor));
	localStorage.setItem("GameLog" + SN, JSON.stringify(GameLog));
	localStorage.setItem("CurrentTime" + SN, CurrentTime.toString());

	// Reload the summaries
	CurrentStage[1][StageInteractionText] = "@Slot 1";
	SaveStateSlotSummary();

}

// Load the game state on a specific slot
function LoadState(SlotNumber) {

	// If the save file is for the current version, we load
	var SN = SlotNumber.toString();
	if (localStorage.getItem("SaveGameVersion" + SN))
		if (localStorage.getItem("SaveGameVersion" + SN) == SaveGameVersion) {

			// Load the game state
			CurrentChapter = localStorage.getItem("CurrentChapter" + SN);
			CurrentScreen = localStorage.getItem("CurrentScreen" + SN);
			Common_PlayerName = localStorage.getItem("Common_PlayerName" + SN);
			Common_PlayerOwner = localStorage.getItem("Common_PlayerOwner" + SN);
			Common_PlayerLover = localStorage.getItem("Common_PlayerLover" + SN);
			PlayerInventory = JSON.parse(localStorage.getItem("PlayerInventory" + SN));
			PlayerLockedInventory = JSON.parse(localStorage.getItem("PlayerLockedInventory" + SN));
			Actor = JSON.parse(localStorage.getItem("Actor" + SN));
			GameLog = JSON.parse(localStorage.getItem("GameLog" + SN));
			PlayerSkill = JSON.parse(localStorage.getItem("PlayerSkill" + SN));
			CurrentTime = parseFloat(localStorage.getItem("CurrentTime" + SN));

			// Makes sure the owner and lover aren't null from previous saves
			if (Common_PlayerOwner == null) Common_PlayerOwner = "";
			if (Common_PlayerLover == null) Common_PlayerLover = "";

			// You can start with different clothes on chapter 12
			if (CurrentChapter == "C012_AfterClass") {
				Common_PlayerCloth = localStorage.getItem("Common_PlayerCloth" + SN);
				if (Common_PlayerCloth == null) Common_PlayerCloth = "Clothed";
				PlayerClothes(Common_PlayerCloth);
			}

			// Make sure the actor array is wide enough (to remove when save games will be reset)
			for (var A = 0; L < Actor.length; A++)
				if (Actor[L].length < 11)
					Actor[L] = [Actor[L][0], Actor[L][1], Actor[L][2], Actor[L][3], Actor[L][4], Actor[L][5], Actor[L][6], Actor[L][7], Actor[L][8], false, ""];

			// Make sure the game log array is wide enough (to remove when save games will be reset)
			for (var L = 0; L < GameLog.length; L++)
				if (GameLog[L].length < 4)
					GameLog[L] = [GameLog[L][0], GameLog[L][1], GameLog[L][2], 0];

			// Starts the game
			LoadRestrainStatus();
			SetScene(CurrentChapter, CurrentScreen);

		}

}


//===========================
// SKILL.JS
//===========================

var PlayerSkill = [];
var PlayerSkillName = 0;
var PlayerSkillLevel = 1;
var PlayerSkillShowLevelUp = 0;

// Add a new skill or raise the skill level if the skill is already known
function PlayerAddSkill(SkillToAdd, LevelToAdd) {

	// Shows the new skill warning for 15 seconds
	PlayerSkillShowLevelUp = Math.round(15 * 1000 / RunInterval);

	// If the skill is already known, we raise the level
	for (var I = 0; I < PlayerSkill.length; I++)
		if (SkillToAdd == PlayerSkill[I][PlayerSkillName]) {
			PlayerSkill[I][PlayerSkillLevel] = PlayerSkill[I][PlayerSkillLevel] + LevelToAdd;
			if (PlayerSkill[I][PlayerSkillLevel] > 10) PlayerSkill[I][PlayerSkillLevel] = 10;
			return;
		}
		
	// If the skill isn't known, we add it to the player skill list
	if (LevelToAdd > 10) LevelToAdd = 10;
	PlayerSkill[PlayerSkill.length] = [SkillToAdd, LevelToAdd];

}

// Returns the current level of a specific skill (0 if the skill isn't known)
function PlayerGetSkillLevel(SkillToQuery) {
	for (var I = 0; I < PlayerSkill.length; I++)
		if (SkillToQuery == PlayerSkill[I][PlayerSkillName])
			return PlayerSkill[I][PlayerSkillLevel];
	return 0;
}

//===========================
// STRUGLE.JS
//===========================

// Struggle parameters
var StruggleType = "";
var StruggleDifficulty = ""; // Easy, Normal, Hard, Impossible
var StruggleDifficultyShown = ""; // To translate the shown difficulty
var StruggleMessage = "";
var StruggleDoneMessage = "";
var StruggleX = 0;
var StruggleY = 0;
var StruggleRadius = 0;
var StruggleProgress = 0; // 0 - Not started, 100 - Done
var StruggleNextTick = 0;
var StruggleDone = false;
var StruggleImageFrame = 0;
var StruggleImageFrameMax = 1;
var StruggleImageFrameTime = 0;
var StruggleSkillBonus = 0;

// For each Rope Mastery level, it's 50% easier to struggle out
function StruggleLoad() {
	StruggleDone = false;
	StruggleProgress = 0;
	StruggleSkillBonus = PlayerGetSkillLevel("RopeMastery");
}

// The next tick to lower the struggle time comes faster with harder levels
function StruggleGetNextTick() {
	if ((StruggleDifficulty == "Easy") && (StruggleProgress <= 33)) StruggleNextTick = CurrentTime + 600;
	if ((StruggleDifficulty == "Easy") && (StruggleProgress > 33) && (StruggleProgress <= 66)) StruggleNextTick = CurrentTime + 450;
	if ((StruggleDifficulty == "Easy") && (StruggleProgress > 66)) StruggleNextTick = CurrentTime + 300;
	if ((StruggleDifficulty == "Normal") && (StruggleProgress <= 33)) StruggleNextTick = CurrentTime + 400;
	if ((StruggleDifficulty == "Normal") && (StruggleProgress > 33) && (StruggleProgress <= 66)) StruggleNextTick = CurrentTime + 325;
	if ((StruggleDifficulty == "Normal") && (StruggleProgress > 66)) StruggleNextTick = CurrentTime + 250;
	if ((StruggleDifficulty == "Hard") && (StruggleProgress <= 33)) StruggleNextTick = CurrentTime + 300;
	if ((StruggleDifficulty == "Hard") && (StruggleProgress > 33) && (StruggleProgress <= 66)) StruggleNextTick = CurrentTime + 225;
	if ((StruggleDifficulty == "Hard") && (StruggleProgress > 66)) StruggleNextTick = CurrentTime + 150;
	if ((StruggleDifficulty == "Impossible") && (StruggleProgress <= 33)) StruggleNextTick = CurrentTime + 250;
	if ((StruggleDifficulty == "Impossible") && (StruggleProgress > 33) && (StruggleProgress <= 66)) StruggleNextTick = CurrentTime + 125;
	if ((StruggleDifficulty == "Impossible") && (StruggleProgress > 66)) StruggleNextTick = CurrentTime + 10;
}

// When the user clicks to struggle
function StruggleClick(SType, SDifficulty, SMessage, SDoneMessage, SX, SY, SRadius) {

	// If the user clicked on a struggling point
	if ((MouseX >= SX - SRadius) && (MouseX <= SX + SRadius) && (MouseY >= SY - SRadius) && (MouseY <= SY + SRadius)) {

		// If we must start a new struggling
		if ((SType != StruggleType) || (StruggleDifficultyShown == "")) {
			StruggleType = SType;
			StruggleDifficulty = SDifficulty;
			StruggleDifficultyShown = GetText(SDifficulty);
			StruggleMessage = SMessage;
			StruggleDoneMessage = SDoneMessage;
			StruggleX = SX;
			StruggleY = SY;
			StruggleRadius = SRadius;
			StruggleProgress = 0;	
			StruggleDone = false;
			StruggleGetNextTick();
		}
		
		// Raise the progress by 2 for each click, 100 is done
		if (StruggleProgress <= 0) StruggleProgress = 8;
		StruggleProgress = StruggleProgress + 2 + StruggleSkillBonus;
		if (StruggleProgress >= 100) {
			StruggleProgress = 100;
			StruggleDone = true;
			StruggleNextTick = CurrentTime + 6000;
		}
	
	}
	
}

// Return the correct background image related to the player's progress
function StruggleGetImage(StruggleStage) {

	// The frame of the image changes faster when progress is higher
	if (StruggleImageFrameTime < CurrentTime) {
		if (StruggleProgress <= 0) StruggleImageFrameTime = CurrentTime + 3000;
		if ((StruggleProgress > 0) && (StruggleProgress <= 33)) StruggleImageFrameTime = CurrentTime + 2000;
		if ((StruggleProgress > 33) && (StruggleProgress <= 66)) StruggleImageFrameTime = CurrentTime + 1300;
		if ((StruggleProgress > 66) && (StruggleProgress < 100)) StruggleImageFrameTime = CurrentTime + 800;
		StruggleImageFrame++;
		if (StruggleImageFrame > StruggleImageFrameMax) StruggleImageFrame = 0;
	}	
	if (StruggleProgress >= 100) StruggleImageFrame = StruggleImageFrameMax + 1;

	// Returns the correct image file
	if (StruggleProgress <= 0) return CurrentChapter + "/" + CurrentScreen + "/Idle_" + StruggleStage.toString() + "_" + StruggleImageFrame.toString() + ".jpg";
	else return CurrentChapter + "/" + CurrentScreen + "/" + StruggleType + "_" + StruggleStage.toString() + "_" + StruggleImageFrame.toString() + ".jpg";

}

// Draw the fight progress in the bottom of the fight scene
function StruggleDraw(NoStruggleMessage, StruggleStage) {
	
	// Draw the background image
	DrawImage(StruggleGetImage(StruggleStage), 0, 0);

	// Draw the struggle text on top
	if (StruggleProgress <= 0) DrawText(NoStruggleMessage, 600, 30, "white");
	if (StruggleProgress >= 100) DrawText(StruggleDoneMessage, 600, 30, "white");
	if ((StruggleProgress > 0) && (StruggleProgress < 100)) { DrawText(StruggleMessage, 600, 30, "white"); DrawCircle(StruggleX, StruggleY, StruggleRadius + 4, 4, "white"); }
	if ((StruggleProgress > 50) && (StruggleProgress < 100)) DrawText(StruggleDifficultyShown, StruggleX, StruggleY + StruggleRadius + 30, "white");

	// Draw the progress meter
	DrawRect(399, 579, 402, 12, "white");
	DrawRect(400, 580, StruggleProgress * 4, 10, "#66FF66");
	DrawRect(400 + (StruggleProgress * 4), 580, (100 - StruggleProgress) * 4, 10, "red");

}

// When the struggle timer runs
function StruggleRun(NoStruggleMessage, StruggleStage) {

	// When the struggle timer ticks
	if (StruggleNextTick <= CurrentTime) {
		
		// If it's done, we call the done procedure from the calling module, if not we lower the struggle progress
		if (StruggleDone) {
			DynamicFunction(CurrentChapter + "_" + CurrentScreen + "_StruggleDone()");
			StruggleDone = false;
			StruggleProgress = 0;
			StruggleType = "";
		} else {
			StruggleProgress--;
			if (StruggleProgress < 0) StruggleProgress = 0;
			StruggleGetNextTick();
		}
		
	}

	// Draw the struggle scene
	StruggleDraw(NoStruggleMessage, StruggleStage);

}

//================
// TIME.JS
//================

var RunTimer = false;
var RunInterval = 20;
var CurrentTimer;
var CurrentTime = 0;
var LimitTimer = 0;
var LimitChapter = "";
var LimitScreen = "";

// Convert milliseconds to written time
function msToTime(s) {

  // Pad to 2 or 3 digits, default is 2
  function pad(n, z) {
    z = z || 2;
    return ('00' + n).slice(-z);
  }

  // Returns the formatted value
  var ms = s % 1000;
  s = (s - ms) / 1000;
  var secs = s % 60;
  s = (s - secs) / 60;
  var mins = s % 60;
  var hrs = (s - mins) / 60;
  return pad(hrs) + ':' + pad(mins) + ':' + pad(secs);

}

// Runs the regular timer
function ProcessTimer() {

	// Ticks the timer every for the screen refresh and events
	clearInterval(CurrentTimer);
	CurrentTimer = setInterval("MainRun()", RunInterval);
	if (PlayerSkillShowLevelUp > 0) PlayerSkillShowLevelUp--;

	// If the timer must run
	if (RunTimer) {

		// Add the interval in milliseconds
		CurrentTime = CurrentTime + RunInterval;

		// If the time limit is reached, we jump to a limit screen
		if (CurrentTime >= LimitTimer) {

			// Jump to the next chapter
			CurrentTime = LimitTimer;
			SetScene(LimitChapter, LimitScreen);

		}

	}

}

// Starts the timer and sets the limits
function StartTimer(LTimer, LChapter, LScreen) {
	RunTimer = true;
	LimitTimer = LTimer;
	LimitChapter = LChapter;
	LimitScreen = LScreen;
	LeaveIcon = "Wait";
	TextPhase = 0;
}

// Stops the timer at a fixed time
function StopTimer(FixedTime) {
	RunTimer = false;
	CurrentTime = FixedTime;
	TextPhase = 0;
	LoadText();
}