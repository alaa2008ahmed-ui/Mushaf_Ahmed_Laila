export interface HadithExplanationEn {
    id: number;
    title: string;
    summary: string;
    creedBenefits: string[];
    fiqhBenefits: string[];
    valuesBenefits: string[];
}

export const NAWAWI_EXPLANATIONS_EN: Record<number, HadithExplanationEn> = {
    1: {
        id: 1,
        title: "Actions are judged by intentions",
        summary: "This great hadith clarifies that the validity, acceptance, and reward of deeds with Allah revolve around the servant's intention and purpose. An act done purely for Allah is accepted and rewarded, while an act done for other than Allah or for a worldly purpose carries no reward. Intention is the distinction between worship and habit.",
        creedBenefits: [
            "The obligation of sincerity and dedicating intention purely to Allah, the Almighty, alone with no partner in all acts of worship.",
            "The grave danger of showing off (riya') and seeking fame or worldly gains through acts of the Hereafter, which invalidates deeds and incurs sin.",
            "That Allah does not accept any deed except that which is done purely for His Face and seeking His pleasure."
        ],
        fiqhBenefits: [
            "The requirement of intention for the validity of all acts of worship such as prayer, fasting, zakat, ablution, ghusl, and pilgrimage.",
            "The place of intention is the heart by consensus of scholars; uttering it aloud is not prescribed and is considered an innovation.",
            "Intention distinguishes ranks of worship from one another, such as distinguishing obligatory from voluntary, and performance from make-up (qada).",
            "Permissible acts (like sleep, eating, and lawful earnings) transform into acts of obedience and closeness to Allah through good intentions."
        ],
        valuesBenefits: [
            "Training the soul to cultivate awareness of Allah's watchfulness in every movement and stillness.",
            "Appreciating the greatness of seeking reward in daily life affairs, family dealings, and professional duties."
        ]
    },
    2: {
        id: 2,
        title: "The Ranks of Religion (Hadith of Jibril)",
        summary: "This hadith is considered the mother of the Sunnah, as it explains the three ranks of religion: Islam (outward physical deeds), Iman (inner matters of faith), and Ihsan (worshiping Allah as though you see Him), along with the signs of the Hour, affirming that its exact time is known only to Allah.",
        creedBenefits: [
            "Affirming the six pillars of faith: believing in Allah, His angels, His books, His messengers, the Last Day, and divine destiny both good and bad.",
            "Allah alone has exclusive knowledge of when the Hour will be established; no sent prophet or close angel knows it.",
            "The status of Ihsan as the highest rank of religion; which is perceiving Allah's presence and watchfulness in private and public.",
            "Believing in the angels and their ability to take human form by Allah's permission."
        ],
        fiqhBenefits: [
            "Clarifying the five practical pillars of Islam and the obligation to adhere to them.",
            "The student's etiquette towards their teacher: sitting well, humility, gentle speech, and polite questioning.",
            "The recommendation of clean clothing, good grooming, and fine appearance in gatherings of knowledge and mosques."
        ],
        valuesBenefits: [
            "Spiritual progression from the rank of Islam to Iman and then to the peak of Ihsan.",
            "The wisdom of questioning in a way that benefits attendees and teaches them their religion, just as Jibril, peace be upon him, did."
        ]
    },
    3: {
        id: 3,
        title: "The Pillars of Islam",
        summary: "The Prophet ﷺ compared Islam to a sturdy building resting on five solid pillars: the two testimonies are the firm foundation, while the remaining pillars (prayer, zakat, pilgrimage, and fasting) are the columns without which the structure does not stand.",
        creedBenefits: [
            "The two testimonies are the origin and foundation of religion; no deed is valid or accepted without them.",
            "The inseparable connection between believing in Oneness and believing in the message of our Prophet Muhammad ﷺ.",
            "That religion is an integrated structure whose obligatory parts cannot be separated for one who wishes to submit to Allah's command."
        ],
        fiqhBenefits: [
            "The central importance of the practical pillars of Islam and their establishment.",
            "The obligation of Zakat and fasting Ramadan as fundamental duties upon capable Muslims.",
            "The wisdom of legislation in connecting spiritual devotion with physical and financial worship."
        ],
        valuesBenefits: [
            "Fostering community solidarity through obligations like Zakat and fasting.",
            "Instilling discipline and steadfastness in daily spiritual routines."
        ]
    },
    4: {
        id: 4,
        title: "Stages of Human Creation",
        summary: "This hadith outlines the physical and spiritual stages of human creation in the womb, and how destiny is decreed, emphasizing the importance of a good ending and that deeds are judged by their conclusions.",
        creedBenefits: [
            "Affirming divine pre-decree (Qadar) and that provisions, lifespan, deeds, and final destiny are already written.",
            "The importance of fearing a bad ending and relying solely on Allah for steadfastness.",
            "The reality of the unseen and that souls and destinies are entirely in Allah's hands."
        ],
        fiqhBenefits: [
            "The sanctity of the fetus after the soul is breathed into it (after 120 days).",
            "Caution against despair and pride; one should always strive in good deeds until death."
        ],
        valuesBenefits: [
            "Striving constantly in righteous deeds and not relying solely on past actions.",
            "Cultivating humility and awareness that hearts are turned by Allah as He wills."
        ]
    },
    5: {
        id: 5,
        title: "Prohibition of Innovations in Religion",
        summary: "This foundational hadith establishes that any newly invented practice in religion that lacks sanction from Allah and His Messenger is completely rejected and invalid.",
        creedBenefits: [
            "The exclusivity of legislation belonging to Allah and His Messenger ﷺ.",
            "Protection of the Islamic creed and worship from additions, deletions, and distortions."
        ],
        fiqhBenefits: [
            "The rejection of all unauthorized innovations (bid'ah) in religious matters.",
            "That every act of worship must be based on clear textual evidence from the Quran and Sunnah."
        ],
        valuesBenefits: [
            "Adhering to authenticity and avoiding blind following of unverified practices.",
            "Clarity and peace of mind in following the straightforward path of the Sunnah."
        ]
    },
    6: {
        id: 6,
        title: "Staying Away from Doubts",
        summary: "This hadith clarifies that lawful and unlawful matters are clear, while between them lie doubtful matters. Guarding against doubts protects one's religion and honor, and highlights the supreme importance of the heart.",
        creedBenefits: [
            "Magnifying the divine prohibitions and treating them as a sacred sanctuary.",
            "The profound connection between outward piety and the soundness of the inner heart."
        ],
        fiqhBenefits: [
            "Precaution in matters of halal and haram by avoiding ambiguous gray areas.",
            "The principle of precautionary measures to safeguard obligatory and prohibited boundaries."
        ],
        valuesBenefits: [
            "Developing scrupulousness (wara') and moral sensitivity.",
            "Protecting personal reputation and religious integrity from suspicion."
        ]
    },
    7: {
        id: 7,
        title: "Religion is Sincere Advice",
        summary: "The Prophet ﷺ summarizes the essence of religion as sincere advice (nasihah) directed towards Allah, His Book, His Messenger, leaders of the Muslims, and the general public.",
        creedBenefits: [
            "Fulfilling rights due to Allah, His Book, and His Messenger with utmost devotion.",
            "Respecting legitimate authority while maintaining sincere counsel for the Muslim community."
        ],
        fiqhBenefits: [
            "Promoting social responsibility, mutual care, and cooperation in righteousness.",
            "Guiding leaders and ordinary citizens with wisdom and sincere goodwill."
        ],
        valuesBenefits: [
            "Cultivating altruism, love, and constructive community welfare.",
            "Rejecting deceit, betrayal, and selfishness."
        ]
    },
    8: {
        id: 8,
        title: "Inviolability of Muslim Blood and Wealth",
        summary: "This hadith establishes the fundamental protection of a Muslim's life and property unless violated by legitimate legal due process under Islamic law.",
        creedBenefits: [
            "The ultimate sanctity of human life and property in Islam.",
            "Reckoning of inner faith and ultimate judgments belong to Allah."
        ],
        fiqhBenefits: [
            "Due process and lawful exceptions where capital punishment or legal penalties apply.",
            "Protection of basic human rights and civil security."
        ],
        valuesBenefits: [
            "Promoting peace, safety, and mutual respect within society.",
            "Preventing vigilantism and unlawful aggression."
        ]
    },
    9: {
        id: 9,
        title: "Prohibition of Excessive Questioning",
        summary: "The Prophet ﷺ advises focusing on what is commanded and avoiding excessive, hypothetical, or burdensome questioning which caused previous nations to stray.",
        creedBenefits: [
            "Submitting willingly to divine directives without unnecessary hesitation or argument.",
            "Appreciating prophetic wisdom in legislation and ease."
        ],
        fiqhBenefits: [
            "Focusing on practical religious duties within one's capacity.",
            "Avoiding pedantry and hair-splitting in legal rulings."
        ],
        valuesBenefits: [
            "Embracing ease and flexibility in daily religious practice.",
            "Fostering practical action over idle debate."
        ]
    },
    10: {
        id: 10,
        title: "Reasons for Answered Prayers",
        summary: "This hadith emphasizes that Allah is pure and only accepts what is pure, warning that unlawful earnings and consumption act as barriers to the acceptance of supplication.",
        creedBenefits: [
            "Affirming Allah's absolute purity and perfection.",
            "The importance of lawful (halal) sustenance in spiritual elevation."
        ],
        fiqhBenefits: [
            "The absolute necessity of earning and consuming purely halal wealth.",
            "Conditions for answered prayers, including sincerity, lawful provision, and earnest supplication."
        ],
        valuesBenefits: [
            "Integrity in earning a livelihood and financial honesty.",
            "Humility and dependence on Allah when raising hands in supplication."
        ]
    },
    11: {
        id: 11,
        title: "Leave What Makes You Doubt",
        summary: "A golden rule of moral and spiritual precaution: abandoning matters that cause doubt in favor of those that are clear and unquestionable.",
        creedBenefits: [
            "Cultivating certainty (yaqin) and spiritual clarity.",
            "Relying on spiritual intuition and clear conscience."
        ],
        fiqhBenefits: [
            "Ruling of precaution when facing ambiguous legal situations.",
            "Choosing the safer, cleaner path in religious observance."
        ],
        valuesBenefits: [
            "Mental peace and freedom from anxiety caused by hesitation.",
            "High ethical standards and moral integrity."
        ]
    },
    12: {
        id: 12,
        title: "Occupying Oneself with What Benefits",
        summary: "The perfection of a person's Islam is demonstrated by leaving alone that which does not concern them, focusing instead on meaningful spiritual and worldly duties.",
        creedBenefits: [
            "Focusing on one's own spiritual accountability before Allah.",
            "Valuing time as the ultimate capital of the believer."
        ],
        fiqhBenefits: [
            "Avoiding intrusive behavior, gossip, and unnecessary interference in others' affairs.",
            "Prioritizing essential religious and worldly responsibilities."
        ],
        valuesBenefits: [
            "Dignity, privacy, and respectful social boundaries.",
            "Productivity and efficient use of personal time."
        ]
    },
    13: {
        id: 13,
        title: "Perfection of Faith",
        summary: "True faith requires a believer to love for their brother or sister what they love for themselves, fostering brotherhood and solidarity.",
        creedBenefits: [
            "Faith is deeply connected to moral character and sincere affection for fellow believers.",
            "Unity of the Muslim community through shared empathy."
        ],
        fiqhBenefits: [
            "Mutual rights and obligations among members of the community.",
            "Encouraging generosity and altruism."
        ],
        valuesBenefits: [
            "Eradicating selfishness, envy, and malice.",
            "Building deep bonds of love and brotherhood."
        ]
    },
    14: {
        id: 14,
        title: "When is a Muslim's Blood Lawful?",
        summary: "Clarifies the specific legal conditions under which capital punishment can be applied in an Islamic society.",
        creedBenefits: [
            "Respecting the sanctity of life granted by Allah.",
            "Upholding divine justice on earth."
        ],
        fiqhBenefits: [
            "The three legal exceptions: married adulterer, murder in retaliation (qisas), and apostasy with treason.",
            "Strict adherence to judicial proof and court processes."
        ],
        valuesBenefits: [
            "Rule of law and social order.",
            "Deterrence against heinous crimes."
        ]
    },
    15: {
        id: 15,
        title: "Hospitality and Good Speech",
        summary: "Connects faith in Allah and the Last Day with noble social ethics: speaking good or remaining silent, honoring neighbors, and hosting guests generously.",
        creedBenefits: [
            "Faith is demonstrated through righteous actions and good character.",
            "Accountability for every word spoken."
        ],
        fiqhBenefits: [
            "Rights of neighbors and guests as emphasized in Islamic law.",
            "Guarding the tongue from harmful speech."
        ],
        valuesBenefits: [
            "Hospitality, generosity, and kindness to neighbors.",
            "Mindful and constructive communication."
        ]
    },
    16: {
        id: 16,
        title: "Prohibition of Anger",
        summary: "A concise and profound piece of advice from the Prophet ﷺ: 'Do not become angry,' emphasizing self-control and emotional restraint.",
        creedBenefits: [
            "Recognizing anger as a destructive force that ruins character and relationships.",
            "Seeking refuge in Allah from Satan's whispers during provocation."
        ],
        fiqhBenefits: [
            "Controlling emotional outbursts and avoiding harmful reactions.",
            "Wisdom in dispensing tailored advice suited to individuals."
        ],
        valuesBenefits: [
            "Patience, emotional intelligence, and forbearance.",
            "Maintaining peace and cool judgment under pressure."
        ]
    },
    17: {
        id: 17,
        title: "Excellence in All Things",
        summary: "Allah has prescribed excellence (ihsan) in all things, even in difficult tasks like slaughtering animals, requiring mercy, skill, and kindness.",
        creedBenefits: [
            "Recognizing Allah's perfection and His love for excellence in all actions.",
            "Extending compassion to all living creatures."
        ],
        fiqhBenefits: [
            "Rules of humane treatment of animals and precision in execution.",
            "Applying high standards of craftsmanship and duty."
        ],
        valuesBenefits: [
            "Compassion, professionalism, and high ethical standards.",
            "Striving for perfection in every endeavor."
        ]
    },
    18: {
        id: 18,
        title: "Good Character",
        summary: "Advice to fear Allah wherever you are, follow up bad deeds with good deeds to erase them, and treat people with beautiful, noble character.",
        creedBenefits: [
            "Constant awareness of Allah's presence (Taqwa).",
            "The transformative power of repentance and good deeds."
        ],
        fiqhBenefits: [
            "Balancing religious duties with exemplary social conduct.",
            "Redeeming past mistakes through righteous action."
        ],
        valuesBenefits: [
            "High moral character, kindness, and integrity in public and private.",
            "Resilience and continuous self-improvement."
        ]
    },
    19: {
        id: 19,
        title: "Safeguard Allah and He Will Safeguard You",
        summary: "Profound advice given by the Prophet ﷺ to young Ibn Abbas regarding reliance on Allah, divine decree, and mindfulness of religious boundaries.",
        creedBenefits: [
            "Absolute trust in Allah (Tawakkul) and recognition that benefit and harm come from Him alone.",
            "Belief in pre-decree: pens have been lifted and pages dried."
        ],
        fiqhBenefits: [
            "Turning exclusively to Allah in prayer, need, and supplication.",
            "Guarding Allah's commands and limits."
        ],
        valuesBenefits: [
            "Self-reliance coupled with ultimate dependence on Allah.",
            "Courage, peace of mind, and freedom from fear of creation."
        ]
    },
    20: {
        id: 20,
        title: "Modesty is Part of Faith",
        summary: "A timeless maxim from early prophecy: 'If you do not feel ashamed, then do as you wish,' highlighting modesty as a core moral compass.",
        creedBenefits: [
            "Modesty (haya) as a fundamental guardian of faith and morality.",
            "The continuity of core ethical truths across prophetic traditions."
        ],
        fiqhBenefits: [
            "Upholding public decency and personal modesty.",
            "Recognizing when moral boundaries are abandoned."
        ],
        valuesBenefits: [
            "Shame as a deterrent against shameful behavior.",
            "Self-respect and dignity."
        ]
    },
    21: {
        id: 21,
        title: "Righteousness in Islam",
        summary: "A concise summary of the entire religion requested by a Companion: 'Say: I believe in Allah, and then be steadfast.'",
        creedBenefits: [
            "Firm belief in Allah as the bedrock of faith.",
            "The vital importance of steadfastness (istiqamah) until death."
        ],
        fiqhBenefits: [
            "Consistency in performing religious duties.",
            "Simplicity and clarity in core Islamic tenets."
        ],
        valuesBenefits: [
            "Perseverance, dedication, and lifelong commitment to righteousness.",
            "Inner strength and spiritual resilience."
        ]
    },
    22: {
        id: 22,
        title: "The Path to Paradise",
        summary: "A reassuring dialogue confirming that fulfilling the obligatory duties and observing lawful and unlawful boundaries leads directly to Paradise.",
        creedBenefits: [
            "The immense mercy of Allah in making the path to salvation clear and accessible.",
            "Confidence in Allah's promises for those who fulfill obligations."
        ],
        fiqhBenefits: [
            "Focusing on the core obligatory acts of worship and avoiding major sins.",
            "Simplicity of religious requirements for salvation."
        ],
        valuesBenefits: [
            "Hope, optimism, and dedication to essential duties.",
            "Relief from unnecessary burdens."
        ]
    },
    23: {
        id: 23,
        title: "Comprehensive Virtues",
        summary: "Enumerates sublime virtues: purity, dhikr, prayer, charity, patience, and the Quran as a proof for or against a person.",
        creedBenefits: [
            "The supreme value of remembrance of Allah and spiritual purification.",
            "The Quran as a living testament that will testify for or against every human."
        ],
        fiqhBenefits: [
            "The spiritual significance of ritual purity, prayer, and charity.",
            "The role of patience as illumination in life."
        ],
        valuesBenefits: [
            "Patience, gratitude, and constant spiritual reflection.",
            "Conscious moral choice in daily life."
        ]
    },
    24: {
        id: 24,
        title: "Allah's Bounties and Prohibition of Injustice",
        summary: "A sacred hadith (Hadith Qudsi) where Allah declares injustice forbidden upon Himself and among His servants, inviting all to seek His guidance, provision, and forgiveness.",
        creedBenefits: [
            "Allah's absolute justice and complete freedom from injustice.",
            "Human dependency on Allah for guidance, sustenance, clothing, and forgiveness."
        ],
        fiqhBenefits: [
            "Prohibition of oppression and injustice in all its forms.",
            "The constant need for seeking Allah's forgiveness (istighfar)."
        ],
        valuesBenefits: [
            "Humility, recognizing one's complete dependence on the Creator.",
            "Fairness, justice, and compassion toward others."
        ]
    },
    25: {
        id: 25,
        title: "The Virtue of Dhikr (Remembrance)",
        summary: "The Prophet ﷺ teaches the Companions that acts of charity and remembrance (tasbih, tahmid, tahlil, takbir) are available to all, even transforming lawful marital intimacy into a rewarded act.",
        creedBenefits: [
            "Allah's boundless generosity in opening endless avenues for rewards.",
            "Sanctifying daily life actions through conscious intention."
        ],
        fiqhBenefits: [
            "The legality and reward of fulfilling lawful human desires with proper intention.",
            "The vast scope of charitable deeds beyond monetary giving."
        ],
        valuesBenefits: [
            "Gratitude, mindfulness, and finding spiritual meaning in everyday life.",
            "Equitable opportunity for spiritual reward regardless of wealth."
        ]
    },
    26: {
        id: 26,
        title: "Many Paths of Goodness",
        summary: "Every joint in the human body must give charity daily: acting justly between people, helping someone with their mount, speaking a good word, walking to prayer, and removing harm from the road.",
        creedBenefits: [
            "Gratitude for the physical blessings of the human body through daily acts of charity.",
            "Every positive social interaction holds spiritual weight."
        ],
        fiqhBenefits: [
            "The broad definition of charity in Islam.",
            "Community service and public welfare as religious duties."
        ],
        valuesBenefits: [
            "Civic responsibility, helpfulness, and kindness.",
            "Daily mindfulness of good deeds."
        ]
    },
    27: {
        id: 27,
        title: "Righteousness and Good Character",
        summary: "Defines righteousness (birr) as good character, and sin as that which wavers in the chest even if people issue legal opinions permitting it.",
        creedBenefits: [
            "The deep alignment between divine law and a sound spiritual conscience.",
            "Valuing internal moral clarity over societal rationalizations."
        ],
        fiqhBenefits: [
            "Consulting one's heart regarding ambiguous moral dilemmas.",
            "The primacy of good character in Islamic ethics."
        ],
        valuesBenefits: [
            "Integrity, moral sensitivity, and inner conscience.",
            "Kindness and noble behavior."
        ]
    },
    28: {
        id: 28,
        title: "Hearing and Obeying",
        summary: "A moving farewell-style admonition to fear Allah, listen and obey legitimate authorities, hold fast to the Sunnah, and beware of innovations.",
        creedBenefits: [
            "Taqwa as the foundation of steadfastness in times of tribulation.",
            "Adherence to the Sunnah of the Prophet and the Rightly Guided Caliphs."
        ],
        fiqhBenefits: [
            "Maintaining social cohesion and lawful authority.",
            "Rejecting innovations in religious matters."
        ],
        valuesBenefits: [
            "Loyalty, stability, and vigilance against extremism and deviance.",
            "Emotional depth and reverence when receiving wise counsel."
        ]
    },
    29: {
        id: 29,
        title: "Doors of Goodness",
        summary: "Muadh bin Jabal asks about acts leading to Paradise, leading the Prophet to explain the pillars of Islam, doors of goodness, the peak of religion (jihad), and the critical importance of guarding one's tongue.",
        creedBenefits: [
            "Recognizing the grand pillars and peaks of Islam.",
            "The immense danger posed by unchecked speech."
        ],
        fiqhBenefits: [
            "Comprehensive view of worship, night prayers, and striving in Allah's cause.",
            "Accountability for spoken words."
        ],
        valuesBenefits: [
            "Mindfulness of speech, tact, and wisdom.",
            "Aspiration for the highest spiritual ranks."
        ]
    },
    30: {
        id: 30,
        title: "The Limits of Allah",
        summary: "Allah has laid down obligations, set boundaries, forbidden certain things, and remained silent on others out of mercy; do not neglect obligations, cross boundaries, or search excessively into matters left unmentioned.",
        creedBenefits: [
            "Respecting divine boundaries and legislative wisdom.",
            "Appreciating Allah's mercy in things left unmentioned."
        ],
        fiqhBenefits: [
            "Adhering strictly to explicit obligations and prohibitions.",
            "Avoiding obsessive questioning into unnecessary legal details."
        ],
        valuesBenefits: [
            "Contentment, discipline, and respect for divine limits.",
            "Focusing energy on what is beneficial."
        ]
    },
    31: {
        id: 31,
        title: "Asceticism in the World",
        summary: "A man asks for an act that will make Allah and people love him; the Prophet replied: 'Renounce the world and Allah will love you, and renounce what people have and people will love you.'",
        creedBenefits: [
            "Detachment from excessive worldly obsession earns divine love.",
            "Self-sufficiency and non-reliance on people earns human respect."
        ],
        fiqhBenefits: [
            "Balancing legitimate worldly needs with spiritual priorities.",
            "Contentment (qana'ah) with what Allah has provided."
        ],
        valuesBenefits: [
            "Humility, generosity, and freedom from greed.",
            "Dignity and emotional independence."
        ]
    },
    32: {
        id: 32,
        title: "No Harm and No Retaliation of Harm",
        summary: "A foundational legal maxim in Islam prohibiting both initiating harm against others and retaliating in an unjustified manner.",
        creedBenefits: [
            "Justice and compassion as universal principles in Islam.",
            "Protecting the welfare of individuals and society."
        ],
        fiqhBenefits: [
            "Rejection of harmful practices, negligence, and nuisance in civil life.",
            "The basis of tort law and injury compensation in jurisprudence."
        ],
        valuesBenefits: [
            "Consideration for others, peaceful coexistence, and civility.",
            "Fairness and conflict resolution."
        ]
    },
    33: {
        id: 33,
        title: "The Burden of Proof is on the Claimant",
        summary: "Establishes the vital judicial rule that the burden of proof rests upon the claimant, while the oath is upon the one who denies the allegation.",
        creedBenefits: [
            "Upholding truth and justice in legal disputes.",
            "Protecting innocent parties from false accusations."
        ],
        fiqhBenefits: [
            "Procedural rules of Islamic jurisprudence and courtroom evidence.",
            "Preventing frivolous lawsuits and false claims over wealth and blood."
        ],
        valuesBenefits: [
            "Fairness, integrity, and adherence to objective proof.",
            "Protection of rights."
        ]
    },
    34: {
        id: 34,
        title: "Changing Evil",
        summary: "Whoever sees an evil should change it with his hand; if unable, then with his tongue; and if unable, then with his heart, which is the weakest of faith.",
        creedBenefits: [
            "Active moral responsibility within the community.",
            "Hatred of evil in the heart as the baseline of faith."
        ],
        fiqhBenefits: [
            "Hierarchical methodology of correcting wrongs according to capability and wisdom.",
            "Ensuring intervention does not cause greater harm."
        ],
        valuesBenefits: [
            "Social responsibility, courage, and moral integrity.",
            "Wisdom and discretion in reform."
        ]
    },
    35: {
        id: 35,
        title: "The Muslim is the Brother of the Muslim",
        summary: "Prohibits envy, deceit, hatred, and undermining others in trade, emphasizing that Muslims are brothers: no Muslim wrongs, forsakes, lies to, or belittles another.",
        creedBenefits: [
            "Taqwa resides in the heart.",
            "The sacred brotherhood binding all believers."
        ],
        fiqhBenefits: [
            "Prohibition of harmful commercial practices like najash (bidding up prices without intent to buy) and undercutting.",
            "The inviolability of a Muslim's blood, wealth, and honor."
        ],
        valuesBenefits: [
            "Brotherhood, mutual respect, and emotional support.",
            "Humility and the avoidance of arrogance."
        ]
    },
    36: {
        id: 36,
        title: "Fulfilling the Needs of Muslims",
        summary: "Details the immense rewards for relieving a believer's distress, easing hardship, concealing faults, seeking knowledge, and gathering in Allah's houses to study the Quran.",
        creedBenefits: [
            "Divine assistance is given to those who help their fellow human beings.",
            "The profound blessings of gathering for Quranic study and remembrance."
        ],
        fiqhBenefits: [
            "Encouragement for charitable acts, debt relief, and sheltering others' faults.",
            "The immense merit of seeking knowledge and studying religious texts."
        ],
        valuesBenefits: [
            "Altruism, empathy, community care, and lifelong learning.",
            "Desire for spiritual gatherings."
        ]
    },
    37: {
        id: 37,
        title: "The Reward for Good Deeds",
        summary: "Details Allah's immense grace: intending a good deed is rewarded even if unperformed, and multiplied manifold if performed; intending a bad deed without doing it is written as a full good deed, and only as a single bad deed if committed.",
        creedBenefits: [
            "Witnessing Allah's boundless mercy, grace, and generosity toward His servants.",
            "The spiritual value of pure intentions."
        ],
        fiqhBenefits: [
            "Encouragement to maintain good intentions constantly.",
            "Understanding the divine recording of deeds."
        ],
        valuesBenefits: [
            "Hope in Allah's mercy, optimism, and eagerness to plan righteous actions.",
            "Caution against persisting in deliberate sins."
        ]
    },
    38: {
        id: 38,
        title: "The Reward for Befriending Allah's Allies",
        summary: "A sacred hadith declaring war on whoever shows hostility to a wali (friend) of Allah, and explaining how drawing near through obligatory and supererogatory acts earns divine love and profound spiritual protection.",
        creedBenefits: [
            "The exalted status of Allah's righteous allies (awliya).",
            "The spiritual journey from fulfilling obligations to attaining divine love and closeness."
        ],
        fiqhBenefits: [
            "The importance of performing obligatory acts followed by supererogatory (nawafil) prayers and deeds.",
            "Protection of the senses and limbs through righteous devotion."
        ],
        valuesBenefits: [
            "Dedication, spiritual discipline, and love for the righteous.",
            "Deep trust in Allah's responsiveness to supplication."
        ]
    },
    39: {
        id: 39,
        title: "Forgiveness for Error and Forgetfulness",
        summary: "Verily, Allah has pardoned for this nation error, forgetfulness, and that which they are forced or coerced into doing.",
        creedBenefits: [
            "Allah's immense mercy and leniency toward His creation.",
            "Relief from accountability in cases of genuine mistake, forgetfulness, or duress."
        ],
        fiqhBenefits: [
            "Absence of legal liability or sin in cases of involuntary errors, amnesia, or coercion.",
            "Nullification of forced contracts or oaths."
        ],
        valuesBenefits: [
            "Reassurance, peace of mind, and gratitude for divine compassion.",
            "Forgiveness toward others who make honest mistakes."
        ]
    },
    40: {
        id: 40,
        title: "Be in the World as a Stranger",
        summary: "The Prophet ﷺ advised Ibn Umar: 'Be in the world as if you were a stranger or a traveler,' urging preparation for the Hereafter and living with acute awareness of the brevity of life.",
        creedBenefits: [
            "The transient nature of this worldly life compared to the eternal Hereafter.",
            "Detachment from excessive materialism."
        ],
        fiqhBenefits: [
            "Urgency in performing righteous deeds without procrastination.",
            "Utilizing health before sickness and life before death."
        ],
        valuesBenefits: [
            "Zuhd (asceticism), mindfulness of death, and purposeful living.",
            "Humility and traveler-like simplicity."
        ]
    },
    41: {
        id: 41,
        title: "Following Desires",
        summary: "None of you truly believes until his personal desires and inclinations are completely subservient to that which the Prophet ﷺ brought.",
        creedBenefits: [
            "Subordinating personal whims and desires to divine revelation.",
            "The true test of faith is complete submission to prophetic guidance."
        ],
        fiqhBenefits: [
            "Aligning moral judgments and daily choices with Islamic law.",
            "Rejecting personal innovations that contradict the Sunnah."
        ],
        valuesBenefits: [
            "Self-discipline, humility, and absolute loyalty to truth.",
            "Overcoming ego and selfishness."
        ]
    },
    42: {
        id: 42,
        title: "The Vastness of Allah's Forgiveness",
        summary: "A breathtaking Hadith Qudsi where Allah promises that as long as a servant calls upon Him and hopes in Him, no matter how great their sins or errors, He will forgive them completely if they meet Him without associating partners with Him.",
        creedBenefits: [
            "The infinite breadth of Allah's mercy and forgiveness.",
            "The supreme importance of pure Tawhid (oneness of Allah) in securing ultimate salvation."
        ],
        fiqhBenefits: [
            "Encouragement never to despair of Allah's mercy regardless of past sins.",
            "The obligation of sincere repentance and turning back to Allah."
        ],
        valuesBenefits: [
            "Boundless hope, optimism, and trust in the Most Merciful.",
            "Relief from spiritual despair and guilt."
        ]
    }
};
