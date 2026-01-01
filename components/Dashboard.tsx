// filepath: c:\Users\yavuz\OneDrive\Masaüstü\Longhorn\lethrinus-dashboard\components\Dashboard.tsx
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../services/api';
import { Task, JournalEntry, AccentColor } from '../types';
import { format } from 'date-fns';
import {
  CheckCircle2,
  CalendarDays,
  FileText,
  Upload,
  ArrowRight,
  Gamepad2,
  Tv,
  Sparkles,
  Clock,
  TrendingUp,
  Zap,
  RefreshCw,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import {
  DecryptedText,
  SpotlightCard,
  Magnet,
  ShinyText,
  FadeIn,
  StaggerContainer,
  CardHover,
  ProgressBar,
  Skeleton,
  TiltCard,
  GlassCard,
  GradientText,
  Shimmer,
  BorderGlow,
  AnimatedCounter,
} from './Animations';

interface DashboardProps {
  accent: AccentColor;
}

const QUOTES = [
  { text: "It's dangerous to go alone! Take this.", source: 'The Legend of Zelda' },
  { text: 'The cake is a lie.', source: 'Portal' },
  { text: 'Do or do not. There is no try.', source: 'Star Wars' },
  { text: 'Winter is coming.', source: 'Game of Thrones' },
  { text: "I'm sorry, Dave. I'm afraid I can't do that.", source: '2001: A Space Odyssey' },
  { text: 'War... war never changes.', source: 'Fallout' },
  { text: 'Would you kindly?', source: 'BioShock' },
  { text: "Don't panic.", source: "Hitchhiker's Guide to the Galaxy" },
  { text: 'May the Force be with you.', source: 'Star Wars' },
  { text: 'I am Groot.', source: 'Guardians of the Galaxy' },
  { text: 'Why so serious?', source: 'The Dark Knight' },
  { text: 'To infinity and beyond!', source: 'Toy Story' },
  { text: 'Just keep swimming.', source: 'Finding Nemo' },
  { text: 'Hakuna Matata.', source: 'The Lion King' },
  { text: "I'll be back.", source: 'The Terminator' },
  { text: 'You shall not pass!', source: 'The Lord of the Rings' },
  { text: 'Houston, we have a problem.', source: 'Apollo 13' },
  { text: 'Life is like a box of chocolates.', source: 'Forrest Gump' },
  { text: 'Here\'s looking at you, kid.', source: 'Casablanca' },
  { text: 'You talking to me?', source: 'Taxi Driver' },
  { text: 'I see dead people.', source: 'The Sixth Sense' },
  { text: 'There\'s no place like home.', source: 'The Wizard of Oz' },
  { text: 'I\'m the king of the world!', source: 'Titanic' },
  { text: 'Carpe diem. Seize the day.', source: 'Dead Poets Society' },
  { text: 'Elementary, my dear Watson.', source: 'Sherlock Holmes' },
  { text: 'Keep your friends close, but your enemies closer.', source: 'The Godfather' },
  { text: 'I\'ll make him an offer he can\'t refuse.', source: 'The Godfather' },
  { text: 'You can\'t handle the truth!', source: 'A Few Good Men' },
  { text: 'Show me the money!', source: 'Jerry Maguire' },
  { text: 'You had me at hello.', source: 'Jerry Maguire' },
  { text: 'I feel the need... the need for speed!', source: 'Top Gun' },
  { text: 'Nobody puts Baby in a corner.', source: 'Dirty Dancing' },
  { text: 'I\'m going to make him an offer he can\'t refuse.', source: 'The Godfather' },
  { text: 'The first rule of Fight Club is: You do not talk about Fight Club.', source: 'Fight Club' },
  { text: 'I am Iron Man.', source: 'Iron Man' },
  { text: 'With great power comes great responsibility.', source: 'Spider-Man' },
  { text: 'I am inevitable.', source: 'Avengers: Endgame' },
  { text: 'I love you 3000.', source: 'Avengers: Endgame' },
  { text: 'Dread it. Run from it. Destiny arrives all the same.', source: 'Avengers: Infinity War' },
  { text: 'I don\'t feel so good.', source: 'Avengers: Infinity War' },
  { text: 'On your left.', source: 'Captain America: The Winter Soldier' },
  { text: 'I can do this all day.', source: 'Captain America' },
  { text: 'That\'s my secret, Captain. I\'m always angry.', source: 'The Avengers' },
  { text: 'Puny god.', source: 'The Avengers' },
  { text: 'I have a bad feeling about this.', source: 'Star Wars' },
  { text: 'These aren\'t the droids you\'re looking for.', source: 'Star Wars' },
  { text: 'I find your lack of faith disturbing.', source: 'Star Wars' },
  { text: 'The Force will be with you. Always.', source: 'Star Wars' },
  { text: 'I am your father.', source: 'Star Wars' },
  { text: 'Use the Force, Luke.', source: 'Star Wars' },
  { text: 'In a galaxy far, far away...', source: 'Star Wars' },
  { text: 'The Matrix has you.', source: 'The Matrix' },
  { text: 'There is no spoon.', source: 'The Matrix' },
  { text: 'Welcome to the real world.', source: 'The Matrix' },
  { text: 'I know kung fu.', source: 'The Matrix' },
  { text: 'Morpheus is fighting Neo!', source: 'The Matrix' },
  { text: 'What is real?', source: 'The Matrix' },
  { text: 'You take the blue pill...', source: 'The Matrix' },
  { text: 'There is no escaping reason.', source: 'The Matrix' },
  { text: 'I\'m going to need a bigger boat.', source: 'Jaws' },
  { text: 'Here\'s Johnny!', source: 'The Shining' },
  { text: 'All work and no play makes Jack a dull boy.', source: 'The Shining' },
  { text: 'Redrum! Redrum!', source: 'The Shining' },
  { text: 'The truth is out there.', source: 'The X-Files' },
  { text: 'I want to believe.', source: 'The X-Files' },
  { text: 'Trust no one.', source: 'The X-Files' },
  { text: 'The truth is rarely pure and never simple.', source: 'The Importance of Being Earnest' },
  { text: 'To be or not to be, that is the question.', source: 'Hamlet' },
  { text: 'All the world\'s a stage.', source: 'As You Like It' },
  { text: 'What light through yonder window breaks?', source: 'Romeo and Juliet' },
  { text: 'A rose by any other name would smell as sweet.', source: 'Romeo and Juliet' },
  { text: 'The game is afoot!', source: 'Sherlock Holmes' },
  { text: 'The name\'s Bond. James Bond.', source: 'James Bond' },
  { text: 'Shaken, not stirred.', source: 'James Bond' },
  { text: 'Nobody does it better.', source: 'James Bond' },
  { text: 'Bond. James Bond.', source: 'James Bond' },
  { text: 'Live and let die.', source: 'James Bond' },
  { text: 'The world is not enough.', source: 'James Bond' },
  { text: 'Tomorrow never dies.', source: 'James Bond' },
  { text: 'You only live twice.', source: 'James Bond' },
  { text: 'From Russia with love.', source: 'James Bond' },
  { text: 'Diamonds are forever.', source: 'James Bond' },
  { text: 'For your eyes only.', source: 'James Bond' },
  { text: 'A view to a kill.', source: 'James Bond' },
  { text: 'The spy who loved me.', source: 'James Bond' },
  { text: 'On Her Majesty\'s Secret Service.', source: 'James Bond' },
  { text: 'You know my name.', source: 'James Bond' },
  { text: 'The living daylights.', source: 'James Bond' },
  { text: 'Licence to kill.', source: 'James Bond' },
  { text: 'GoldenEye.', source: 'James Bond' },
  { text: 'The world is not enough.', source: 'James Bond' },
  { text: 'Die another day.', source: 'James Bond' },
  { text: 'Casino Royale.', source: 'James Bond' },
  { text: 'Quantum of Solace.', source: 'James Bond' },
  { text: 'Skyfall.', source: 'James Bond' },
  { text: 'Spectre.', source: 'James Bond' },
  { text: 'No Time to Die.', source: 'James Bond' },
  // Leyla ile Mecnun
  { text: 'Hayat bir şakadır, gülmeyi bilmek lazım.', source: 'Leyla ile Mecnun' },
  { text: 'Her şey bir gün biter, ama dostluklar asla.', source: 'Leyla ile Mecnun' },
  { text: 'Hayatın anlamı arkadaşlıktır.', source: 'Leyla ile Mecnun' },
  { text: 'Bazen en saçma şeyler en mantıklı olanlardır.', source: 'Leyla ile Mecnun' },
  { text: 'Aşk delilikse, ben deliyim.', source: 'Leyla ile Mecnun' },
  // The Walking Dead
  { text: 'We are the walking dead.', source: 'The Walking Dead' },
  { text: 'In this life now, you kill or you die. Or you die and you kill.', source: 'The Walking Dead' },
  { text: 'We don\'t kill the living.', source: 'The Walking Dead' },
  { text: 'We\'re all infected.', source: 'The Walking Dead' },
  { text: 'Survival is not enough.', source: 'The Walking Dead' },
  { text: 'We\'re not too far gone.', source: 'The Walking Dead' },
  { text: 'We can all come back from this.', source: 'The Walking Dead' },
  // The Last Kingdom
  { text: 'Destiny is all.', source: 'The Last Kingdom' },
  { text: 'I am Uhtred, son of Uhtred.', source: 'The Last Kingdom' },
  { text: 'Wyrd bið ful aræd.', source: 'The Last Kingdom' },
  { text: 'Fate is inexorable.', source: 'The Last Kingdom' },
  { text: 'I will have my revenge.', source: 'The Last Kingdom' },
  { text: 'The sword is mightier than the word.', source: 'The Last Kingdom' },
  // The Boys
  { text: 'I\'m not a hero. I\'m a supe.', source: 'The Boys' },
  { text: 'The real heroes are the ones who do the right thing.', source: 'The Boys' },
  { text: 'Power corrupts, and absolute power corrupts absolutely.', source: 'The Boys' },
  { text: 'We\'re the ones who watch the watchmen.', source: 'The Boys' },
  { text: 'Sometimes the only way to stop a bad guy with superpowers is a good guy with superpowers.', source: 'The Boys' },
  // Taboo
  { text: 'I have a use for you.', source: 'Taboo' },
  { text: 'I am a difficult man to kill.', source: 'Taboo' },
  { text: 'I have returned from the dead.', source: 'Taboo' },
  { text: 'I will have what is mine.', source: 'Taboo' },
  // Andor
  { text: 'I\'d rather die trying to take them down than die giving them what they want.', source: 'Andor' },
  { text: 'One way out.', source: 'Andor' },
  { text: 'I can\'t swim.', source: 'Andor' },
  { text: 'Rebellions are built on hope.', source: 'Andor' },
  { text: 'The Empire is a disease that thrives in darkness.', source: 'Andor' },
  // Lord of the Rings
  { text: 'One ring to rule them all.', source: 'The Lord of the Rings' },
  { text: 'Not all those who wander are lost.', source: 'The Lord of the Rings' },
  { text: 'All we have to decide is what to do with the time that is given us.', source: 'The Lord of the Rings' },
  { text: 'Even the smallest person can change the course of the future.', source: 'The Lord of the Rings' },
  { text: 'The road goes ever on and on.', source: 'The Lord of the Rings' },
  { text: 'I will take the Ring, though I do not know the way.', source: 'The Lord of the Rings' },
  { text: 'My precious.', source: 'The Lord of the Rings' },
  { text: 'You shall not pass!', source: 'The Lord of the Rings' },
  { text: 'Fly, you fools!', source: 'The Lord of the Rings' },
  { text: 'The world is changed.', source: 'The Lord of the Rings' },
  // Daredevil
  { text: 'I\'m not seeking penance for what I\'ve done. I\'m asking forgiveness for what I\'m about to do.', source: 'Daredevil' },
  { text: 'The only way to stop a bad guy with a gun is a good guy with a gun.', source: 'Daredevil' },
  { text: 'I\'m not the bad guy.', source: 'Daredevil' },
  { text: 'Justice is not a privilege, it\'s a right.', source: 'Daredevil' },
  { text: 'I can\'t see, but I can sense everything.', source: 'Daredevil' },
  // The Count of Monte Cristo
  { text: 'Wait and hope.', source: 'The Count of Monte Cristo' },
  { text: 'All human wisdom is contained in these two words: Wait and Hope.', source: 'The Count of Monte Cristo' },
  { text: 'Revenge is a dish best served cold.', source: 'The Count of Monte Cristo' },
  { text: 'I am not what I was.', source: 'The Count of Monte Cristo' },
  { text: 'The world is mine.', source: 'The Count of Monte Cristo' },
  // Reacher
  { text: 'I\'m a drifter. I go where I want.', source: 'Reacher' },
  { text: 'Details matter.', source: 'Reacher' },
  { text: 'I don\'t like to be pushed.', source: 'Reacher' },
  { text: 'I\'m not a hero. I\'m just a guy who does the right thing.', source: 'Reacher' },
  { text: 'The truth is always simple.', source: 'Reacher' },
  // Severance
  { text: 'What is it that we do here?', source: 'Severance' },
  { text: 'The work is mysterious and important.', source: 'Severance' },
  { text: 'We sever the connection between work and home.', source: 'Severance' },
  { text: 'Who are you?', source: 'Severance' },
  { text: 'The outside world is a distraction.', source: 'Severance' },
  // Silo
  { text: 'We don\'t know what\'s outside.', source: 'Silo' },
  { text: 'The truth is dangerous.', source: 'Silo' },
  { text: 'We live in the silo. We die in the silo.', source: 'Silo' },
  { text: 'What if everything we know is a lie?', source: 'Silo' },
  { text: 'The outside is toxic.', source: 'Silo' },
  // From
  { text: 'You can\'t leave. The road always brings you back.', source: 'From' },
  { text: 'This place is a prison.', source: 'From' },
  { text: 'The monsters come at night.', source: 'From' },
  { text: 'There\'s no way out.', source: 'From' },
  { text: 'We\'re trapped here forever.', source: 'From' },
  // Game of Thrones / House of the Dragon
  { text: 'Winter is coming.', source: 'Game of Thrones' },
  { text: 'A Lannister always pays his debts.', source: 'Game of Thrones' },
  { text: 'Valar morghulis.', source: 'Game of Thrones' },
  { text: 'Valar dohaeris.', source: 'Game of Thrones' },
  { text: 'The night is dark and full of terrors.', source: 'Game of Thrones' },
  { text: 'Fire and blood.', source: 'House of the Dragon' },
  { text: 'The realm, the realm, the realm.', source: 'House of the Dragon' },
  { text: 'History does not remember blood. It remembers names.', source: 'House of the Dragon' },
  { text: 'Dreams didn\'t make us kings. Dragons did.', source: 'House of the Dragon' },
  { text: 'The crown cannot stand strong if the House of the Dragon is at war with itself.', source: 'House of the Dragon' },
  // Arcane
  { text: 'We\'ll show them all.', source: 'Arcane' },
  { text: 'I thought you could change the world.', source: 'Arcane' },
  { text: 'The difference between a hero and a villain is perspective.', source: 'Arcane' },
  { text: 'Power is just an opportunity made real.', source: 'Arcane' },
  { text: 'We\'ll show them what we\'re made of.', source: 'Arcane' },
  // Shogun
  { text: 'A man must choose his own path.', source: 'Shogun' },
  { text: 'In Japan, honor is everything.', source: 'Shogun' },
  { text: 'The way of the warrior is death.', source: 'Shogun' },
  { text: 'Power is not given, it is taken.', source: 'Shogun' },
  { text: 'A samurai serves his master until death.', source: 'Shogun' },
  // 3 Body Problem
  { text: 'The universe is a dark forest.', source: '3 Body Problem' },
  { text: 'Every civilization is an armed hunter.', source: '3 Body Problem' },
  { text: 'The truth is stranger than fiction.', source: '3 Body Problem' },
  { text: 'We are not alone in the universe.', source: '3 Body Problem' },
  { text: 'The laws of physics are not universal.', source: '3 Body Problem' },
  // Merlin
  { text: 'Magic is not a curse, it\'s a gift.', source: 'Merlin' },
  { text: 'The old ways are not forgotten.', source: 'Merlin' },
  { text: 'Destiny is a gift.', source: 'Merlin' },
  { text: 'Magic must be used for good.', source: 'Merlin' },
  { text: 'The future is not written.', source: 'Merlin' },
  // Limitless
  { text: 'What if you could access 100% of your brain?', source: 'Limitless' },
  { text: 'The human brain is the most powerful computer.', source: 'Limitless' },
  { text: 'There are no limits to what you can achieve.', source: 'Limitless' },
  { text: 'Knowledge is power.', source: 'Limitless' },
  { text: 'Your potential is limitless.', source: 'Limitless' },
  // Flower of Evil
  { text: 'The truth will set you free.', source: 'Flower of Evil' },
  { text: 'Love can overcome any darkness.', source: 'Flower of Evil' },
  { text: 'The past always catches up with you.', source: 'Flower of Evil' },
  { text: 'Sometimes the ones we love are the most dangerous.', source: 'Flower of Evil' },
  // Death\'s Game
  { text: 'Death is not the end, it\'s a new beginning.', source: 'Death\'s Game' },
  { text: 'Life is a game, and death is the final level.', source: 'Death\'s Game' },
  { text: 'Every death teaches us something.', source: 'Death\'s Game' },
  // The King of Pigs
  { text: 'Power corrupts absolutely.', source: 'The King of Pigs' },
  { text: 'The strong prey on the weak.', source: 'The King of Pigs' },
  { text: 'In a world of pigs, be a king.', source: 'The King of Pigs' },
  // Carnival Row
  { text: 'In a world of monsters, be human.', source: 'Carnival Row' },
  { text: 'The fae are not monsters, they are people.', source: 'Carnival Row' },
  { text: 'Love knows no boundaries.', source: 'Carnival Row' },
  { text: 'The truth will always come out.', source: 'Carnival Row' },
  // Over the Garden Wall
  { text: 'Ain\'t that just the way.', source: 'Over the Garden Wall' },
  { text: 'That\'s a rock fact!', source: 'Over the Garden Wall' },
  { text: 'We\'re lost, but we\'re together.', source: 'Over the Garden Wall' },
  { text: 'The unknown is not to be feared, but to be explored.', source: 'Over the Garden Wall' },
  { text: 'Sometimes the journey is more important than the destination.', source: 'Over the Garden Wall' },
  // Pluribus
  { text: 'Unity in diversity.', source: 'Pluribus' },
  { text: 'Together we are stronger.', source: 'Pluribus' },
  { text: 'Many voices, one purpose.', source: 'Pluribus' },
  // Chief of War
  { text: 'War is the father of all things.', source: 'Chief of War' },
  { text: 'A true leader fights alongside his people.', source: 'Chief of War' },
  { text: 'Honor is earned in battle.', source: 'Chief of War' },
  { text: 'The greatest victory is that which requires no battle.', source: 'Chief of War' },
  // Exploding Kittens
  { text: 'Sometimes you just need to explode.', source: 'Exploding Kittens' },
  { text: 'Defuse the situation before it explodes.', source: 'Exploding Kittens' },
  { text: 'Life is like a deck of cards, you never know what you\'ll draw.', source: 'Exploding Kittens' },
  // Istanbul Ansiklopedisi
  { text: 'Her şehrin bir hikayesi vardır.', source: 'İstanbul Ansiklopedisi' },
  { text: 'Tarih sokaklarda yazılır.', source: 'İstanbul Ansiklopedisi' },
  { text: 'Şehirler insanların hafızasıdır.', source: 'İstanbul Ansiklopedisi' },
  { text: 'Her köşe başında bir anı saklı.', source: 'İstanbul Ansiklopedisi' },
  // Behzat Ç.
  { text: 'Adalet herkese lazım, ama herkes adil değil.', source: 'Behzat Ç.' },
  { text: 'Hayat bazen çok acımasız olur, ama biz daha acımasızız.', source: 'Behzat Ç.' },
  { text: 'Gerçekler acıdır ama yalanlar daha acı.', source: 'Behzat Ç.' },
  { text: 'Her şeyin bir bedeli vardır.', source: 'Behzat Ç.' },
  { text: 'İnsanlar değişir, ama adalet değişmez.', source: 'Behzat Ç.' },
  // Ezel
  { text: 'İntikam soğuk yenen bir yemektir.', source: 'Ezel' },
  { text: 'Bazen kaybetmek, kazanmaktan daha değerlidir.', source: 'Ezel' },
  { text: 'Geçmiş asla ölmez, sadece uyur.', source: 'Ezel' },
  { text: 'Aşk ve intikam, ikisi de kör eder insanı.', source: 'Ezel' },
  { text: 'Herkesin bir hikayesi vardır, ama her hikaye mutlu bitmez.', source: 'Ezel' },
  
  // Şahsiyet
  { text: 'Herkesin bir sırrı vardır, bazılarının sırrı daha büyüktür.', source: 'Şahsiyet' },
  { text: 'Gerçekler bazen kurgudan daha ilginçtir.', source: 'Şahsiyet' },
  { text: 'Hafıza, en büyük işkence aletidir.', source: 'Şahsiyet' },
  { text: 'Bazı şeyler unutulmamalı, bazıları unutulmalı.', source: 'Şahsiyet' },

  // 50m2
  { text: 'Bazen en küçük yerler, en büyük sırları saklar.', source: '50m2' },
  { text: 'Geçmiş asla ölmez, sadece saklanır.', source: '50m2' },
  { text: 'Her evin bir hikayesi vardır.', source: '50m2' },
  { text: 'Sırlar bazen en yakınlarda saklanır.', source: '50m2' },
  // İçerde
  { text: 'Bazen iyi ve kötü arasındaki çizgi çok incedir.', source: 'İçerde' },
  { text: 'Adalet için bazen kuralları çiğnemek gerekir.', source: 'İçerde' },
  { text: 'Herkesin bir amacı vardır.', source: 'İçerde' },
  { text: 'Güven, kazanılması en zor şeydir.', source: 'İçerde' },
  // Kuzey Güney
  { text: 'Aile bağları hiçbir şeyle kırılamaz.', source: 'Kuzey Güney' },
  { text: 'Bazen en büyük düşman, en yakın arkadaştır.', source: 'Kuzey Güney' },
  { text: 'Sevgi, her şeyi aşar.', source: 'Kuzey Güney' },
  { text: 'Geçmiş, geleceği şekillendirir.', source: 'Kuzey Güney' },
  // Muhteşem Yüzyıl
  { text: 'Güç, sorumluluk getirir.', source: 'Muhteşem Yüzyıl' },
  { text: 'Taht, yalnızlık getirir.', source: 'Muhteşem Yüzyıl' },
  { text: 'Siyaset, en tehlikeli oyundur.', source: 'Muhteşem Yüzyıl' },
  { text: 'Aşk ve güç, ikisi de kör eder.', source: 'Muhteşem Yüzyıl' },
  // Kurtlar Vadisi
  { text: 'Bu dünyada herkes bir rol oynar.', source: 'Kurtlar Vadisi' },
  { text: 'Güç, geçicidir ama onur kalıcıdır.', source: 'Kurtlar Vadisi' },
  { text: 'Bazen en iyi strateji, beklemektir.', source: 'Kurtlar Vadisi' },
  { text: 'Her oyunun bir kuralları vardır.', source: 'Kurtlar Vadisi' },
];

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }
  }
};

export const Dashboard: React.FC<DashboardProps> = ({ accent }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [todayJournal, setTodayJournal] = useState<JournalEntry | null>(null);
  const [quote, setQuote] = useState(QUOTES[0]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ completed: 0, total: 0, streak: 0 });
  const navigate = useNavigate();
  const [catGif, setCatGif] = useState<string>('');

  const rollNewQuote = () => {
    const randomIndex = Math.floor(Math.random() * QUOTES.length);
    setQuote(QUOTES[randomIndex]);
  };

  useEffect(() => {
    setQuote(QUOTES[Math.floor(Math.random() * QUOTES.length)]);
    // Random cat gif selection
    const randomCat = Math.random() < 0.5 ? 'cat_anim1.gif' : 'cat_anim2.gif';
    setCatGif(randomCat);

    const loadData = async () => {
      try {
        const [fetchedTasks, fetchedJournal] = await Promise.all([
          api.getTasks(),
          api.getJournalEntries(),
        ]);

        const today = new Date().toISOString().split('T')[0];
        const todaysEntry = fetchedJournal.find(j => j.date === today);
        setTodayJournal(todaysEntry || null);

        const activeTasks = fetchedTasks.filter(t => t.status !== 'done').slice(0, 5);
        setTasks(activeTasks);

        // Calculate stats
        const completed = fetchedTasks.filter(t => t.status === 'done').length;
        setStats({
          completed,
          total: fetchedTasks.length,
          streak: fetchedJournal.length // Simplified streak calculation
        });
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

  return (
    <motion.div
      className="p-6 lg:p-10 max-w-6xl mx-auto space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header / Briefing */}
      <motion.div variants={itemVariants} className="space-y-4 mb-8 relative">

        <SpotlightCard className="pt-8 pb-8 pl-8 pr-0 relative overflow-visible group min-h-[160px] flex flex-col justify-center">
          <motion.div
            className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-white to-gray-400"
            initial={{ height: 0 }}
            animate={{ height: '100%' }}
            transition={{ duration: 0.8, delay: 0.3 }}
          />

          {/* Roll Button - Inside Panel, Bottom Right, Peeking */}
          <motion.div
            className="absolute right-0 bottom-4 z-0"
            initial={{ x: 16, opacity: 0.4 }}
            animate={{ x: 0, opacity: 0.6 }}
            whileHover={{ x: -12, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          >
            <motion.button
              onClick={rollNewQuote}
              className="p-3 rounded-l-lg bg-white/20 hover:bg-white/30 text-white transition-all backdrop-blur-sm border border-white/30 border-r-0 flex items-center justify-center shadow-lg group-hover:opacity-100"
              whileHover={{ scale: 1.05 }}
              whileTap={{ 
                rotate: 360,
                transition: { duration: 0.6, ease: 'easeInOut' }
              }}
              title="Roll new quote"
            >
              <RefreshCw size={20} />
            </motion.button>
          </motion.div>

          {/* Quote Text with Animation */}
          <AnimatePresence mode="wait">
            <motion.h2
              key={quote.text}
              className="text-2xl font-bold text-white mb-2 font-serif italic relative z-10 max-w-2xl pl-4 pr-129"
              initial={{ opacity: 0, y: 20, x: -20 }}
              animate={{ opacity: 1, y: 0, x: 0 }}
              exit={{ opacity: 0, y: -20, x: 20 }}
              transition={{ duration: 0.4 }}
            >
              "<ShinyText text={quote.text} />"
            </motion.h2>
          </AnimatePresence>

          {/* Source with Animation */}
          <AnimatePresence mode="wait">
            <motion.p
              key={quote.source}
              className="text-white text-sm font-medium relative z-10 pl-4 pr-8"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              — {quote.source}
            </motion.p>
          </AnimatePresence>

          <motion.div
            className="absolute top-0 right-32 text-slate-100 opacity-5 group-hover:opacity-15 transition-opacity z-10"
            whileHover={{ rotate: 22, scale: 1.2 }}
          >
            <Tv size={70} />
          </motion.div>
        </SpotlightCard>
      </motion.div>

      {/* Stats Overview - Enhanced with new animations */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <TiltCard intensity={10}>
          <GlassCard className="p-6 relative overflow-hidden group">
            <Shimmer className="absolute inset-0" />
            <div className="flex items-center gap-4 relative z-10">
              <motion.div
                className="p-3 rounded-xl bg-gradient-to-br from-white-500/20 to-white-600/20 border border-white-500/30"
                whileHover={{ scale: 1.1 }}
                transition={{ duration: 0.5 }}
              >
                <TrendingUp size={20} className="text-white" />
              </motion.div>
              <div className="flex-1">
                <p className="text-3xl font-bold text-white mb-1">
                  <AnimatedCounter value={completionRate} />%
                </p>
                <p className="text-xs text-slate-400 uppercase tracking-wider">Task Completion</p>
              </div>
            </div>
            <div className="mt-4 relative z-10">
              <ProgressBar progress={completionRate} color="#ffffff" />
            </div>
          </GlassCard>
        </TiltCard>

        <TiltCard intensity={10}>
          <GlassCard className="p-6 relative overflow-hidden group">
            <Shimmer className="absolute inset-0" />
            <div className="flex items-center gap-4 relative z-10">
              <motion.div
                className="p-3 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 border border-emerald-500/30"
                whileHover={{scale: 1.1 }}
                transition={{ duration: 0.5 }}
              >
                <CheckCircle2 size={20} className="text-emerald-400" />
              </motion.div>
              <div className="flex-1">
                <p className="text-3xl font-bold text-white mb-1">
                  <AnimatedCounter value={stats.completed} />
                </p>
                <p className="text-xs text-slate-400 uppercase tracking-wider">Tasks Completed</p>
              </div>
            </div>
          </GlassCard>
        </TiltCard>

        <TiltCard intensity={10}>
          <GlassCard className="p-6 relative overflow-hidden group">
            <Shimmer className="absolute inset-0" />
            <div className="flex items-center gap-4 relative z-10">
              <motion.div
                className="p-3 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-600/20 border border-amber-500/30"
                whileHover={{scale: 1.1 }}
                transition={{ duration: 0.5 }}
              >
                <Zap size={20} className="text-amber-400" />
              </motion.div>
              <div className="flex-1">
                <p className="text-3xl font-bold text-white mb-1">
                  <AnimatedCounter value={stats.streak} />
                </p>
                <p className="text-xs text-slate-400 uppercase tracking-wider">Day Streak</p>
              </div>
            </div>
          </GlassCard>
        </TiltCard>
      </motion.div>

      {/* Quick Access Grid - Enhanced with BorderGlow */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: CalendarDays, label: 'Diary', path: '/journal', color: '#ffffff' },
          { icon: CheckCircle2, label: 'Active Tasks', path: '/tasks', color: '#ffffff' },
          { icon: FileText, label: 'Archives', path: '/notes', color: '#ffffff' },
          { icon: Upload, label: 'Storage', path: '/files', color: '#ffffff' },
        ].map((item, index) => (
          <motion.div
            key={item.path}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * index, type: 'spring', stiffness: 200 }}
          >
            <BorderGlow color={item.color} intensity={0.6}>
              <motion.button
                onClick={() => navigate(item.path)}
                className="w-full h-full p-6 flex flex-col items-center gap-4 relative z-10 group"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <motion.div
                  className="p-4 rounded-2xl relative overflow-hidden"
                  style={{ backgroundColor: `${item.color}20` }}
                  transition={{ duration: 0.6 }}
                >
                  <item.icon size={28} style={{ color: item.color }} />
                  <Shimmer className="absolute inset-0" />
                </motion.div>
                <GradientText
                  text={item.label}
                  className="text-sm font-bold tracking-wide uppercase"
                  gradient={[item.color, item.color + '80', item.color]}
                />
              </motion.button>
            </BorderGlow>
          </motion.div>
        ))}
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Daily Log */}
        <motion.div variants={itemVariants}>
          <SpotlightCard className="p-6 h-full flex flex-col">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Clock size={14} />
                Daily Log
              </h3>
              <Link
                to="/journal"
                className="text-xs font-bold text-white hover:text-gray-300 flex items-center gap-1 group"
              >
                OPEN
                <motion.div
                  className="inline-block"
                  whileHover={{ x: 3 }}
                >
                  <ArrowRight size={12} />
                </motion.div>
              </Link>
            </div>

            {loading ? (
              <div className="space-y-3">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-20 w-full" />
              </div>
            ) : todayJournal ? (
              <motion.div
                    className="flex-1 p-4 rounded-xl bg-black/20 border border-white/5 cursor-pointer hover:border-white/30 transition-all flex flex-col"
                onClick={() => navigate('/journal')}
                whileHover={{ scale: 1.01 }}
              >
                <h4 className="font-bold text-white mb-2 flex items-center gap-2">
                  <Sparkles size={14} className="text-white" />
                  {todayJournal.title || 'Untitled Log'}
                </h4>
                <div className="relative h-20 overflow-hidden">
                  <p className="text-sm text-slate-400 leading-relaxed">
                    {todayJournal.content}
                  </p>
                  <div className="absolute bottom-0 left-0 w-full h-10 bg-gradient-to-t from-[#131316] to-transparent" />
                </div>
              </motion.div>
            ) : (
              <div className="text-center py-8 text-slate-500 bg-black/20 rounded-xl border border-dashed border-white/5">
                <p className="text-xs mb-3">
                  No entry recorded for {format(new Date(), 'dd.MM.yyyy')}.
                </p>
                <motion.button
                  onClick={() => navigate('/journal')}
                  className="px-4 py-2 bg-white/10 text-white border border-white/30 rounded-lg text-xs font-bold uppercase transition-colors hover:bg-white/20"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Write Entry
                </motion.button>
              </div>
            )}
          </SpotlightCard>
        </motion.div>

        {/* Current Questline */}
        <motion.div variants={itemVariants}>
          <SpotlightCard className="p-6 h-full">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Zap size={14} />
                Active Tasks
              </h3>
              <Link
                to="/tasks"
                className="text-xs font-bold text-white hover:text-gray-300 flex items-center gap-1 group"
              >
                TASK LOG
                <motion.div className="inline-block" whileHover={{ x: 3 }}>
                  <ArrowRight size={12} />
                </motion.div>
              </Link>
            </div>

            <div className="space-y-2">
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))
              ) : tasks.length > 0 ? (
                tasks.map((task, index) => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-3 rounded-lg bg-black/20 border border-white/5 hover:bg-white/5 hover:border-white/20 transition-all cursor-pointer group"
                    onClick={() => navigate('/tasks')}
                    whileHover={{ x: 5 }}
                  >
                    <div className="flex items-center gap-3">
                      <motion.div
                        className={`w-2 h-2 rounded-sm ${
                          task.priority === 'high'
                            ? 'bg-red-500'
                            : task.priority === 'medium'
                            ? 'bg-amber-500'
                            : 'bg-emerald-500'
                        }`}
                        animate={task.priority === 'high' ? { scale: [1, 1.2, 1] } : {}}
                        transition={{ duration: 1, repeat: Infinity }}
                      />
                      <span className="text-sm font-medium text-slate-300 group-hover:text-white transition-colors">
                        {task.title}
                      </span>
                    </div>
                    <motion.div
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      initial={{ x: -5 }}
                      whileHover={{ x: 0 }}
                    >
                      <ArrowRight size={14} className="text-white" />
                    </motion.div>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-8 text-slate-500 text-xs uppercase">
                  <Sparkles size={24} className="mx-auto mb-2 text-slate-600" />
                  No active tasks.
                </div>
              )}
            </div>
          </SpotlightCard>
        </motion.div>
      </div>

      {/* Cat GIF - Bottom Right */}
      {catGif && (
        <motion.div
          className="fixed bottom-6 right-6 z-50"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.5, type: 'spring', damping: 15 }}
        >
          <motion.div
            className="relative"
            whileHover={{ scale: 1.2 }}
            transition={{ duration: 0.3 }}
            style={{
              filter: 'drop-shadow(0 0 8px rgba(255, 255, 255, 0.3))',
            }}
          >
            <motion.img
              src={`/${catGif}`}
              alt="Cat animation"
              className="w-24 h-24 object-contain cursor-pointer relative z-10"
              style={{
                imageRendering: 'auto',
                transform: 'scale(1.3)',
              }}
            />
            <motion.div
              className="absolute inset-0 -z-10 rounded-full blur-xl opacity-0"
              whileHover={{
                opacity: 0.6,
                scale: 1.3,
              }}
              style={{
                background: 'radial-gradient(circle, rgba(255, 255, 255, 0.8) 0%, transparent 70%)',
              }}
              transition={{ duration: 0.3 }}
            />
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
};

