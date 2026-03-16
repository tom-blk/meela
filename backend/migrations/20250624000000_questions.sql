CREATE TABLE questions (
    id TEXT PRIMARY KEY,
    text TEXT NOT NULL,
    subtitle TEXT,
    info TEXT,
    type TEXT NOT NULL CHECK (type IN ('single', 'multiple')),
    options JSONB NOT NULL,
    max_selections INTEGER,
    sort_order INTEGER NOT NULL DEFAULT 0
);

INSERT INTO questions (id, text, subtitle, info, type, options, max_selections, sort_order) VALUES
(
    'help_with',
    'What do you need help with?',
    'Choose 1-5 skills',
    NULL,
    'multiple',
    '["ADHD/ADD", "Abortion", "Addiction (experienced yourself)", "Addiction (others)", "Adoption", "Aging", "Anger", "Anxiety", "Arranged marriages", "Attachment disorder", "Autism", "Body image", "Bullying", "Cancer", "Chem sex", "Childless not by choice", "Climate", "Co-parenting", "Cultural problems", "Death", "Demanding job", "Dementia", "Depression", "Diabetes", "Discrimination", "Domestic violence", "Eating disorder", "Entrepreneurship", "Erectile dysfunction", "Existential crisis", "Experience of being in a cult", "Exploration of childhood", "Family", "Family estrangement", "Fetischism", "Gambling", "Gaslighting", "Gender identity", "Get life under control", "HIV/AIDS", "Health anxiety", "Hoarding", "Immigration and integration", "Infertility", "Leadership", "Lifestyle", "Loneliness", "Love life", "Made redundant", "Medical trauma", "Menopause", "Mental disability", "Military", "Money", "Mood swings", "Narcissistic personality disorder (experienced yourself)", "Narcissistic personality disorder (others)", "Negative thoughts", "Neurodevelopmental disorders (NDS)", "Obsessive-compulsive disorder (OCD)", "PMS/PMDD", "Panic attacks", "Paranoia", "Parenthood", "Passive aggressive", "Past life events", "Performance anxiety or perfectionism", "Personal development", "Pet loss", "Phobias", "Physical disability", "Polyamory", "Post-traumatic stress disorder (PTSD)", "Pregnancy or post-partum depression", "Psychedelic integration", "Racism", "Relationship to food", "Relationships", "Religion or spirituality", "Retirement", "Self-esteem and self-confidence", "Self-harm", "Separation or divorce", "Serious illness", "Sexism", "Sexual difficulties", "Sexual trauma", "Sexuality", "Sleeping difficulties", "Smoking", "Social media", "Sorrow or grief", "Sport and performance", "Stress or burnout", "Tourette''s syndrome", "Toxic masculinity/macho culture", "Trauma", "Traumatic childbirth", "Unsure of having children", "War", "Work", "World events", "Other"]',
    5,
    1
),
(
    'work_on',
    'What do you want to work on or learn in therapy?',
    'Choose 1-5 skills',
    NULL,
    'multiple',
    '["Acceptance", "Address childhood", "Anger management", "Anxiety management", "Boundary setting", "Build self-esteem", "Changing thought patterns", "Communication", "Conflict management", "Cultural integration", "Explore core cause or problem", "Find balance", "Find purpose and meaning", "Finding meaningful activity", "Get back to work", "Get in touch with feelings", "Handle discrimination", "Handle fluctuating emotions", "Handle grief and loss", "Handle negative thoughts", "Handle racism", "Identify my needs and feelings", "Improving relationships", "Impulse control", "Intimacy", "Managing difficult life events", "Mood management", "Overcome fears", "Problem solving", "Self-love and compassion", "Self-understanding", "Stress management", "Structure and planning", "Trauma healing", "Work out what you want from life", "Other", "I don''t know"]',
    5,
    2
),
(
    'therapy_type',
    'Do you have a specific type of therapy in mind?',
    'There are many types of therapy to choose from. If you want your therapist to decide which therapy is best for you, choose No.',
    NULL,
    'single',
    '["Yes", "No"]',
    NULL,
    3
),
(
    'therapist_age',
    'How old would you prefer your therapist to be?',
    'You can choose up to four age groups.',
    NULL,
    'multiple',
    '["26-35", "36-45", "46-55", "56-65", "Over 65", "Doesn''t matter"]',
    4,
    4
),
(
    'cultural_background',
    'Would you like the therapist to have a certain cultural background?',
    NULL,
    'Cultural background constitutes the ethnic, religious, racial, gender, linguistic or other socioeconomic factors and values that shape an individual''s upbringing. In Sweden there are few non Nordic licensed therapists. We can therefore not promise you your preference and choice.',
    'single',
    '["Yes", "Doesn''t matter"]',
    NULL,
    5
);
