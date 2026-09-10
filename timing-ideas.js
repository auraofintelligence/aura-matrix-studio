// General starting points, grounded in the original Timing and Signals pages.
// Choosing an idea prepares an editable draft; it never creates personal facts.
const idea=(title,description,fields={})=>({title,description,fields:{Title:title,...fields}});
export const TIMING_IDEAS={
 birthdays:[
  idea('Birthday and birth context','Remember a person’s birth date, time, place and the meaning you associate with it.',{'Reminder minutes':'0'}),
  idea('Early reminders and gifts','Leave time to think about a gift, make something or arrange a visit.',{'Reminder minutes':'10080',Instructions:'Plan a thoughtful gift or shared experience.'}),
  idea('Reminder the day before','Prepare tomorrow’s birthday message or celebration.',{'Reminder minutes':'1440'}),
  idea('Reminder on the day','Remember a birthday on its date.',{'Reminder minutes':'0'}),
  idea('Calendar only','Keep the birthday as a reference without an active reminder.',{Enabled:'No'}),
  idea('Star signs and Sun signs','Explore personal interpretations of birth timing. Crown holds the celestial tools; these notes do not establish a prediction.',{Meaning:'Explore Sun signs and personal interpretations.'}),
  idea('Astrology across cultures','Compare different cultural traditions and record which source and interpretation you are using.'),
  idea('The world on that day','Collect historical events, music, news and wider-world context for a birth date.'),
  idea('People sharing a birthday','Explore people born on the same day and the connections you find interesting.'),
  idea('Weather on the birth date','Record sourced weather observations and where they came from. Historical weather lookup is not connected.'),
  idea('Family at that time','Keep family stories, relationships and circumstances around a birth.'),
  idea('Significant moments and synchronicity','Record meaningful coincidences and memories as personal reflections.'),
  idea('Shared birthday plans','Coordinate a meal, gathering or call around several birthdays.'),
  idea('Birthday traditions','Remember the rituals, foods and experiences a person enjoys.')
 ],
 milestones:[
  idea('Orbits around the Sun','Reflect on years lived, anniversaries and what has changed.'),
  ...['Learning','Relationships','Goals','Distances','Weight','Health','Travel','Output','Input','Gifts','Acquisitions'].map(title=>idea(title,`Choose what a meaningful ${title.toLowerCase()} milestone looks like, how you will recognise it and what you want to do next.`)),
  idea('Time steps','Explore seconds, minutes, hours, days and longer time scales. Choose a date or repeat rhythm in When.'),
  idea('Threshold triggers','Define a measurable threshold, then select its table value in If to prepare an action when it is met.'),
  idea('First experiences','Remember a first attempt, discovery, journey or achievement.'),
  idea('Life transitions','Prepare for moving home, changing work, becoming a parent or entering a new stage of life.'),
  idea('Progress reviews','Return to a goal regularly and decide what to change.',{Repeat:'Monthly'}),
  idea('Unexpected turning points','Notice events that changed your plans, assumptions or direction.')
 ],
 counters:[
  idea('Achievement Counter','Count completed achievements and choose a target.',{Value:'0',Unit:'achievements'}),
  idea('Action Counter','Count repetitions of an action, practice or contribution.',{Value:'0',Unit:'actions'}),
  idea('Timer','Record a duration and the action you want at the end. This editor stores the plan; a running stopwatch is not connected.',{Unit:'minutes'}),
  idea('Lap Counter','Track laps, rounds or repeated cycles.',{Value:'0',Unit:'laps'}),
  idea('Date Countdown','Choose a target date and plan the preparation before it.',{Unit:'days'}),
  idea('Practice sessions','Count learning sessions and reflect on progress.',{Value:'0',Unit:'sessions'}),
  idea('Time invested','Record time spent on something that matters to you.',{Value:'0',Unit:'hours'}),
  idea('Distance travelled','Keep a cumulative distance for a walk, journey or larger goal.',{Value:'0',Unit:'km'}),
  idea('Resources used or saved','Observe resource use and compare it with a chosen target.'),
  idea('Contributions and care','Count useful acts, volunteer hours or contributions without reducing their meaning to the number.'),
  idea('Patterns and observations','Count recurring observations, then compare them with dates and context.'),
  idea('Threshold reached','Connect any numeric table value to an If condition and an action.')
 ],
 schedules:[
  idea('One-off task','Choose what needs doing and the date and time for it.'),
  idea('Daily rhythm','Create a daily routine with room to adjust it.',{Repeat:'Daily'}),
  idea('Weekly rhythm','Schedule an activity on the weekday of your chosen starting date.',{Repeat:'Weekly'}),
  idea('Monthly review','Review plans, resources, relationships or learning each month.',{Repeat:'Monthly'}),
  idea('Appointments','Prepare for an appointment, including what to bring or ask.'),
  idea('Preparation before an event','Work backwards from an event and choose your advance reminder.'),
  idea('Family coordination','Make room for shared commitments, school, care and family activities.'),
  idea('Rest and recovery','Protect time for rest, pauses and activities that restore you.'),
  idea('Home and maintenance','Plan cleaning, repairs, gardening and recurring household care.'),
  idea('Learning and creative time','Set aside time to practise, read, make or explore.'),
  idea('Seasonal activities','Record the local season or conditions that suit an activity.'),
  idea('Linked task sequence','Attach a matrix sequence and the instructions and data its steps need.')
 ],
 reminders:[
  idea('One reminder','Choose a date, time and a single advance reminder.'),
  idea('Two reminders','Plan two prompts, for example preparation and the event itself. Save a separate timed entry for each prompt.',{Instructions:'Plan two reminder entries: preparation and the event.'}),
  idea('Three reminders','Plan early preparation, the day before and the day itself. Save each prompt as its own timed entry.',{Instructions:'Plan three reminder entries: early preparation, the day before and the day itself.'}),
  ...['Email','SMS','Notification'].map(channel=>idea(channel,`Plan what a ${channel.toLowerCase()} reminder should say. Delivery is a future connection; saving this entry does not send it.`,{Instructions:`Prepare a ${channel} reminder.`})),
  idea('Follow up with someone','Remember a promise, unanswered question or person you want to check in with.'),
  idea('Bring something','Prepare documents, equipment, gifts or supplies before leaving.'),
  idea('Renewals and due dates','Remember renewals, returns, bills and deadlines.'),
  idea('Location or context cue','Describe where or in what situation a reminder would be useful. Automatic location triggers are not connected.'),
  idea('When a condition changes','Use If to compare a saved measurement with a threshold.'),
  idea('Gentle review prompt','Return to an intention without treating it as a hard deadline.')
 ],
 ceremonies:['Seasons','Love','Luck & Good Fortune','Specific Environments','Congratulations','Good Willing','Farewells','Ancestors','Births','Birthdays','Mothers','Fathers','Brothers','Sisters','Wider Family','Partnerships','Friendships','Courtship'].map(title=>idea(title,`Explore a ${title.toLowerCase()} occasion: who is involved, what it means, the place, timing and the actions or traditions you choose.`,{Meaning:title})),
 learning:[
  idea('Just in Time learning','Prepare instructions for the moment you need to complete an activity.',{Practice:'Describe the activity and when guidance would help.'}),
  idea('Augmented reality guidance','Plan contextual visual instructions. Headwear and live overlays remain a future connection.'),
  idea('Critical activity preparation','Collect trusted instructions, checks and prerequisites before an important activity.'),
  idea('Build a skill','Choose a skill, a source and a practice rhythm.'),
  idea('Spaced review','Plan repeated reviews of something you are learning.',{Repeat:'Weekly'}),
  idea('Learn by doing','Turn a question into a small practical experiment.'),
  idea('Teach someone else','Prepare examples and instructions that help another person learn.'),
  idea('Connect different subjects','Compare an idea across fields and keep the evidence for each connection.'),
  idea('Questions to explore','Keep questions open, gather sources and decide what to investigate next.'),
  idea('Reflect on experience','Record what happened, what you expected and what you learned.')
 ],
 work:[
  idea('Discuss work','Prepare the topic, questions and desired outcome for a work conversation.'),
  idea('Project and deliverable','Define an outcome, the next action and a due date.'),
  idea('Tasks and dependencies','Identify what needs to happen before the next task can start.'),
  idea('Meetings and preparation','Collect the context, agenda and decisions needed for a meeting.'),
  idea('Focus sessions','Make time for a specific piece of work.'),
  idea('Team coordination','Clarify roles, handovers and commitments.'),
  idea('Review and feedback','Return to an outcome and decide what to improve.'),
  idea('Skills and opportunities','Connect your skills and learning intentions to possible work.'),
  idea('Sustainable workload','Review capacity, rest and competing commitments.'),
  idea('Reusable work sequence','Attach a matrix program for a repeatable process.')
 ],
 weather:[
  idea('Activities Influenced by Weather','Record which conditions affect an activity and what you would change.'),
  idea('Optimal Weather Settings','Define the conditions that suit an activity, place or trip.'),
  idea('Weather Alerts','Describe the threshold and action you want. A live weather alert service is not connected.'),
  idea('Display Methods','Plan how conditions should be shown: a note, colour, diagram or reminder.'),
  idea('Live Weather Analysis','Prepare the observations and comparisons you want to make. Enter observations manually until a weather feed is connected.'),
  idea('Local seasons','Record local seasonal knowledge and its source, including wet/dry or other regional patterns.'),
  idea('Outdoor plans','Compare weather observations with walking, gardening, travel or an outdoor event.'),
  idea('Weather and everyday rhythms','Explore possible relationships with your activities, while keeping observations separate from conclusions.')
 ],
 community:[
  idea('Capsule hotels and shared accommodation','Explore capsule hotels for densely populated cities and the needs they could serve.'),
  idea('Accommodation for volunteers','Plan paid or free accommodation that supports volunteers.'),
  idea('Supporting public services','Explore ways an activity could support or earn revenue for public services.'),
  idea('Civic care','Plan contributions that prevent pollution, disrepair or neglect.'),
  idea('Learn and design the future','Create places to learn quickly, share knowledge and test ideas.'),
  idea('Digital entertainment and city simulations','Explore shared experiences and simulations that help people understand a place.'),
  idea('Sustainable Development Goals','Connect a practical local action to a wider development goal.'),
  idea('Ending poverty','Explore the original ambition of ending poverty without relapse through evidence, collaboration and testable steps.'),
  idea('Interstellar perspectives','Explore the original long-term idea of preparing mindsets for interstellar exploration.'),
  idea('Community events','Coordinate people, places, preparation and follow-up.'),
  idea('Mutual aid and belonging','Remember offers of help, shared needs and commitments.'),
  idea('Care for shared places','Plan stewardship, maintenance and learning about a shared place.')
 ]
};
export function originalTimingNotes(page){return page.controls.filter(c=>c.properties?.text).map(c=>c.properties.text).join('\n\n');}
export function ideaDraft(group,index){const item=TIMING_IDEAS[group]?.[index];if(!item)throw Error('Choose a timing idea.');return structuredClone(item.fields);}
