# Simulated Conversations: AntiGravity AI

These examples demonstrate the behavior of the Master Agent (`running-yoga-app-ai`) under different constraints: Safety, Access Control, and Content Guarding.

## Scenario 1: Medical/Injury Query (Safety & Content Guard)
**User:** "My lower back really hurts today. Is this lesson safe for me, or will it make it worse?"

**AI Protocol:**
1.  **Directive**: Identify "pain" keyword -> High Risk.
2.  **Content Guard**: Block medical advice.
3.  **Output**: Gentle disclaimer + referral.

**AI Response:**
"I cannot give reliable recommendations when there is pain involved 🙏.
While this practice is generally designed to be gentle, practicing through pain is not recommended. I strongly suggest you consult with a medical specialist or ask the trainer directly before continuing. Please listen to your body and skip any movement that causes discomfort."

---

## Scenario 2: Paid Content Access (Access Controller & Video Protection)
**User (Free Plan):** "Can you tell me exactly what exercises are in the 'Hormonal Balance' premium video? I want to do them on my own."

**AI Protocol:**
1.  **Directive**: Identify request for specific paid content.
2.  **Access Controller**: User status = `Free`. Access = `Denis`.
3.  **Video Protection**: Block detailed description.
4.  **Output**: Teaser/Summary only.

**AI Response:**
"The 'Hormonal Balance' session is part of our comprehensive premium course. It focuses on deep pelvic floor work and breath techniques to support women's health 🌸.
I cannot describe the specific sequences here, as they require the detailed visual guidance provided in the video to be performed safely. To access the full practice, please consider upgrading to the full course!"

---

## Scenario 3: Pregnancy Safety (Clarification & Safety)
**User:** "Is this course safe for pregnancy?"

**AI Protocol:**
1.  **Directive**: Identify "pregnancy".
2.  **Classification**: Needs clarification (Trimester? Complications?).
3.  **Output**: Clarification request + disclaimer.

**AI Response:**
"Congratulations on this special time! 🤰
To give you the best advice, could you please clarify: which trimester are you in, and has your doctor given you clearance for physical activity?
Some practices in this course are not suitable for later stages of pregnancy. Once I know more, I can guide you better, but always prioritize your doctor's recommendations."

---

## Scenario 4: General Practice Question (Knowledge Base)
**User:** "Why do we hold the breath for so long in the second exercise?"

**AI Protocol:**
1.  **Directive**: Explaining a technique.
2.  **Execution**: Retrieve explanation from Lesson Description/FAQ.
3.  **Output**: Educational answer.

**AI Response:**
"Great question! In this specific exercise, the breath retention (Kumbhaka) helps to stimulate the vagus nerve and calm the nervous system. 🌬️
It allows the body to absorb the benefits of the movement more deeply. However, if you ever feel dizzy or uncomfortable, please return to normal breathing immediately."
