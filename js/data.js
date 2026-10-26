// Нягтаа: Факт гаригийн аян — all game text, characters, clues and quiz
const GW = 1920, GH = 1080;
const TEST = /[?&]test/.test(location.search), DT_MAX = TEST ? 0.6 : 0.05;

const COL = {
  ink: 0x2a1f5e, inkS: '#2a1f5e', cream: 0xfff8ee, creamS: '#fff8ee', gold: 0xffc94a, goldS: '#ffc94a',
  light: 0xffe27a, dark: 0x5b2a86, darkS: '#5b2a86', mint: 0x3fcf9a, mintS: '#3fcf9a', coral: 0xff6b7a, coralS: '#ff6b7a',
  sky: 0x7fd3ff, lilac: 0xb9a4ff, panel: 0xfffaf2, shade: 0x1b1240,
};

// speaker → display name, name-tag colour, portrait set
const WHO = {
  nyagtaa: { name: 'Нягтаа', col: '#36b8c9' },
  dad: { name: 'Аав Батаа', col: '#3d6fd6' },
  mom: { name: 'Ээж Сарнай', col: '#a565d8' },
  tumur: { name: 'Төмөр', col: '#6aa82a' },
  suvd: { name: 'Сувд', col: '#d77ac9' },
  hunter: { name: 'Анчин Мөнх', col: '#c7782e' },
  wood: { name: 'Модчид', col: '#8a5cc9' },
  neighbor: { name: 'Хөрш', col: '#5a7fa8' },
  khuurmag: { name: 'Хуурмаг', col: '#6b3fb0' },
  narrator: { name: '', col: '#2a1f5e' },
};

// Dialogue lines. `en` is the voice-over script (the game's Faktik voices speak English, text is Mongolian, as in the films).
const L = {
  // tutorial
  t1: { who: 'nyagtaa', face: 'happy', mn: 'Сайн уу! Би Нягтаа. Хуурмаг Фактикийн биед орсныг гадаад төрхөөр нь мэдэхгүй. Цорын ганц тэмдэг нь тэдний үг.', en: "Hi! I'm Nyagtaa. You can't tell from the outside when Khuurmag hides inside a Faktik. The only sign is their words." },
  t2: { who: 'nyagtaa', face: 'thinking', mn: 'Ийм үг сонсвол сэрэмжил! Томруулдаг шилээрээ үг бүр дээр дарж шалгаарай.', en: 'When you hear words like these, be careful! Tap each one with your magnifier.' },
  t3: { who: 'nyagtaa', face: 'notes', mn: 'Миний нууц арга: Долоо нягталж, нэг түгээ! Сэжүүр ол, цүнхэндээ хийж хадгал, дүгнэ, тэгээд шийд.', en: 'My secret method: check seven times, share once! Find clues, keep them in your bag, think it through, then decide.' },
  t4: { who: 'nyagtaa', face: 'curious', mn: 'Энэ бол цаг. Сэжүүр шалгах бүрт цаг зарцуулна. Бүгдийг шалгах цаг байхгүй, тиймээс ухаалгаар сонго!', en: "This is the clock. Every clue costs time, and there isn't time for all of them. Choose wisely!" },
  t5: { who: 'nyagtaa', face: 'surprised', mn: 'Энэ бол Харанхуйн хэмжүүр. Сандрал, яаруу итгэл ихсэх тусам дүүрнэ. Дүүрвэл Хуурмаг томорно!', en: 'This is the darkness meter. Panic and rushing fill it up. When it is full, Khuurmag grows!' },
  t6: { who: 'nyagtaa', face: 'excited', mn: 'Энэ бол Гэрлийн туяа. Зөв алхам бүр гэрэл нэмнэ. Хэн нэгэн "Яар!" гэж хашгирвал эрвээхэй зангиагаа засаад тайвшир!', en: 'And this is my light beam. Every smart step adds light. If someone shouts hurry, fix your bow tie and stay calm!' },
  t7: { who: 'nyagtaa', face: 'wink', mn: 'За, явцгаая!', en: "Okay, let's go!" },
  // 5.1 opening
  m1: { who: 'mom', face: 'p', mn: 'Өө, Нягтаа минь, сайн уу. Удахгүй өвөл болно, бид түлээгээ бэлдэх хэрэгтэй байна.', en: "Oh, Nyagtaa dear, hello. Winter is coming soon, and we need to get our firewood ready." },
  m2: { who: 'mom', face: 'p', mn: 'Нөхөр маань ой руу мод бэлтгэхээр явсан ч бид хурааж амжихгүй байх. Чи жаахан туслаач?', en: "My husband went to the forest for wood, but we won't finish in time. Could you help a little?" },
  n1: { who: 'nyagtaa', face: 'excited', mn: 'Мэдээж! Би туслая!', en: 'Of course! I will help!' },
  m3: { who: 'mom', face: 'p', mn: 'Хөөх, ямар хурдан юм бэ! Ингэвэл өвөлдөө дулаахан байна.', en: "Wow, you're so fast! We'll stay warm all winter." },
  // investigation start
  s1: { who: 'nyagtaa', face: 'thinking', mn: 'Бүгд айгаад ажлаа хаялаа. Гэхдээ эхлээд нягталъя. Тосгон, ойн захыг шалгаж сэжүүр цуглуулъя!', en: "Everyone dropped their work in fear. But first, let's check. I'll look around the village and the forest edge for clues!" },
  // clue lines
  c1q: { who: 'nyagtaa', face: 'curious', mn: 'Батаа ах аа, та баавгайг яг хаана, хэзээ харсан бэ?', en: 'Uncle Bataa, where and when exactly did you see the bear?' },
  c1a: { who: 'dad', face: 'angry', mn: 'Ойд! Нэг газар! Анчин Мөнх ч харсан гэсэн! Асуугаад байлгүй яар!', en: "In the forest! Somewhere! Even Munkh the hunter saw it! Stop asking and hurry!" },
  c1i: { who: 'nyagtaa', face: 'thinking', mn: 'Хаана гэдгээ тодорхой хэлж чадсангүй. Бас анчин харсан гэж байна. Анчнаас өөрөөс нь асуух хэрэгтэй.', en: "He can't say exactly where. And he says the hunter saw it. I should ask the hunter himself." },
  c6q: { who: 'nyagtaa', face: 'curious', mn: 'Баавгай хэр том байсан бэ?', en: 'How big was the bear?' },
  c6a: { who: 'dad', face: 'shocked', mn: 'Миний бодлоор маш том, өлсч байгаа байх! Ийм л байх даа!', en: "I think it's huge, and probably hungry! It must be!" },
  c6i: { who: 'nyagtaa', face: 'notes', mn: '"Миний бодлоор", "байх даа"... Энэ бол баримт биш, үзэл бодол.', en: '"I think", "it must be"... That is not a fact. It is an opinion.' },
  c3i: { who: 'nyagtaa', face: 'surprised', mn: 'Анхаарлын тэмдэг дэндүү их, айлгасан үгс... Энэ гарчиг биднийг бодуулахгүй, сандаргах гэж байна.', en: "So many exclamation marks, such scary words... This headline wants us to panic, not think." },
  c2i: { who: 'nyagtaa', face: 'surprised', mn: 'Манай тосгоны нэр НАРЛАГ. Харин тамга дээр НАРЛААГ гэж байна. Албан ёсны тамгыг дуурайжээ!', en: 'Our village is called Narlag. But the stamp says Narlaag. Someone copied the official stamp!' },
  c4q: { who: 'nyagtaa', face: 'curious', mn: 'Мөнх ах аа, та баавгай харсан гэж үнэн үү?', en: 'Uncle Munkh, is it true that you saw a bear?' },
  c4a: { who: 'hunter', face: 'p', mn: 'Би тэгж хэлээгүй. Өглөөнөөс ойд яваад баавгайн мөр ч хараагүй.', en: "I never said that. I've been in the forest since morning and haven't seen a single bear track." },
  c4i: { who: 'nyagtaa', face: 'excited', mn: 'Аав анчинг харсан гэж хэлсэн. Харин анчин өөрөө үгүйсгэлээ! Энэ бол чухал нотолгоо.', en: 'Bataa said the hunter saw it. But the hunter himself says no! That is key evidence.' },
  c5q: { who: 'nyagtaa', face: 'curious', mn: 'Та нар ойн захад ажиллаж байна. Баавгай харсан уу?', en: "You're working right at the forest edge. Have you seen a bear?" },
  c5a: { who: 'wood', face: 'p', mn: 'Бид тайван ажиллаж байна. Нохой ч хуцаагүй.', en: "We've been working in peace. The dogs haven't even barked." },
  c5i: { who: 'nyagtaa', face: 'notes', mn: 'Ойн дэргэд байгаа хүмүүс юу ч хараагүй. Олон талаас нь сонсох хэрэгтэй юм байна.', en: 'The people right by the forest saw nothing. It helps to hear from different sides.' },
  c7i: { who: 'nyagtaa', face: 'thinking', mn: 'Энэ мөр U хэлбэртэй, хумсны ором алга. Баавгайных биш, мориных байна!', en: 'These prints are U-shaped, with no claw marks. Not a bear. A horse!' },
  c8i: { who: 'nyagtaa', face: 'reading', mn: 'Сарвууны ором дээр хөвд ургачихаж. Энэ хэдэн жилийн өмнөх хуучин ором. Өнөөдрийн нотолгоо биш.', en: "There's moss growing in these claw marks. They're years old. Not evidence of today." },
  c9i: { who: 'nyagtaa', face: 'laugh', mn: 'Хар үс... баавгайных уу? Үгүй ээ, буржгар ямааны ноос байна. Энэ сэжүүрт хууртагдаж цаг алдлаа!', en: "Black hair... a bear's? No, it's curly goat wool. That clue was a trap that cost me time!" },
  yaar1: { who: 'dad', face: 'angry', mn: 'Яар! Яар! Шалгаад суух цаг алга!', en: 'Hurry! Hurry! No time to check!' },
  yaar2: { who: 'dad', face: 'angry', mn: 'Юу хийгээд байгаа юм бэ? Яар!', en: 'What are you doing? Hurry!' },
  calm: { who: 'nyagtaa', face: 'wink', mn: 'Амьсгаа аваад... тайван. Яарах биш, нягтлах!', en: 'Deep breath... calm. Not hurry. Check!' },
  timeup: { who: 'nyagtaa', face: 'surprised', mn: 'Цаг дууслаа! Одоо цуглуулсан сэжүүрээрээ дүгнэх ёстой.', en: "Time is up! Now I have to decide with the clues I've collected." },
  // analysis
  a1: { who: 'nyagtaa', face: 'notes', mn: 'Хэн хэлсэн бэ? — Аав. Өөрөө харсан уу? — Хаана гэдгээ хэлж чадахгүй байна.', en: "Who said it? Bataa. Did he see it himself? He can't say where." },
  a2: { who: 'nyagtaa', face: 'thinking', mn: 'Анчин харсан гэж үү? — Анчин өөрөө үгүйсгэлээ. Тамга нь дуурайлал, мөр нь мориных...', en: 'The hunter saw it? The hunter denied it. The stamp is a copy, the tracks are a horse\'s...' },
  a0: { who: 'nyagtaa', face: 'thinking', mn: 'Сэжүүр цөөхөн байна... Гэхдээ байгаа нотолгоогоо сайн бодоод шийдье.', en: "I don't have many clues... But let me think carefully about what I have." },
  // outcomes
  w1: { who: 'nyagtaa', face: 'confused', mn: 'Би нягтлалгүйгээр итгэчихлээ... Шийтгэл биш, сурах боломж. Дахиад оролдъё!', en: "I believed it without checking... It's not a punishment, it's a chance to learn. Let's try again!" },
  r1: { who: 'nyagtaa', face: 'excited', mn: 'Мэдээ худал байлаа! Хуурмаг аавын үгэнд нуугдаж байжээ. Одоо гэрлээ тусгая!', en: "The news was false! Khuurmag was hiding in Bataa's words. Now let's shine our light!" },
  // ending
  e1: { who: 'nyagtaa', face: 'wink', mn: 'Сэтгэл хөдлөм мэдээ сонсвол зогсоод нягтал. Долоо нягталж, нэг түгээ!', en: 'When you hear exciting news, stop and check. Check seven times, share once!' },
  e2: { who: 'narrator', face: '', mn: 'Хуурмаг алга болоогүй байна. Нягтаагийн аян дөнгөж эхэлж байна...', en: "Khuurmag hasn't disappeared. Nyagtaa's journey is only beginning..." },
  // ambient kids
  k1: { who: 'tumur', face: 'hyped', mn: 'Нягтаа, бөмбөг тоглох уу?', en: 'Nyagtaa, want to play ball?' },
  k2: { who: 'suvd', face: 'laughing', mn: 'Хи-хи! Барь!', en: 'Hee hee! Catch!' },
};

// clue definitions — cost in seconds, correct notebook bin
// bins: trust (Итгэж болох), sus (Сэжигтэй), irr (Хамааралгүй / нотолгоо биш)
const CLUES = {
  c1: { n: 1, title: 'Эх сурвалж', ask: 'Хаана, хэзээ харсан бэ?', card: 'Аав: "Ойд! Нэг газар! Асуугаад байлгүй яар!"', cost: 10, bin: 'sus', method: 'Эх сурвалжийг шалга', loc: 'village', icon: 'ic_who' },
  c2: { n: 2, title: 'Тамга', ask: 'Тамгыг томруулж харах', card: 'Тамга дээр "НАРЛААГ" гэж бичжээ. Жинхэнэ нэр нь НАРЛАГ.', cost: 15, bin: 'sus', method: 'Хаяг, тамгыг шалга', loc: 'village', icon: 'ic_stamp' },
  c3: { n: 3, title: 'Гарчиг', ask: 'Гарчгийг унших', card: '"АЙМШИГ!!! АВАРГА БААВГАЙ БҮГДИЙГ ИДНЭ!!! ЗУГТ!"', cost: 5, bin: 'sus', method: 'Гарчгаас цааш унш', loc: 'village', icon: 'ic_head' },
  c4: { n: 4, title: 'Иш татсан хүн', ask: 'Анчин Мөнхөөс асуух', card: 'Анчин: "Би тэгж хэлээгүй. Баавгайн мөр ч хараагүй."', cost: 20, bin: 'trust', method: 'Иш татсан эх сурвалж бүрийг шалга', loc: 'forest', icon: 'ic_ask', key: true },
  c5: { n: 5, title: 'Тэнцвэр', ask: 'Модчдоос асуух', card: 'Модчид: "Бид тайван ажиллаж байна. Нохой ч хуцаагүй."', cost: 15, bin: 'trust', method: 'Олон талаас нь сонс', loc: 'forest', icon: 'ic_bal' },
  c6: { n: 6, title: 'Баримт уу, бодол уу?', ask: 'Хэр том байсныг асуух', card: 'Аав: "Миний бодлоор маш том, өлсч байгаа байх!"', cost: 10, bin: 'sus', method: 'Баримт ба бодлыг ялга', loc: 'village', icon: 'ic_opin' },
  c7: { n: 7, title: 'Газрын мөр', ask: 'Мөрийг томруулж харах', card: 'Мөр нь U хэлбэртэй, морины туурайных.', cost: 10, bin: 'irr', method: 'Нотлох баримтыг шалга', loc: 'forest', icon: 'ic_track' },
  c8: { n: 7, title: 'Модны ором', ask: 'Модны холтсыг харах', card: 'Сарвууны ором хуучин, хөвд ургасан.', cost: 10, bin: 'irr', method: 'Нотлох баримтыг шалга', loc: 'forest', icon: 'ic_claw' },
  c9: { n: 0, title: 'Хар үс', ask: 'Мөчир дээрх үсийг харах', card: 'Хар үс нь ямааны буржгар ноос байв.', cost: 15, bin: 'irr', method: 'Хууртуулахгүй байх', loc: 'forest', icon: 'ic_hair', trap: true },
};
const BINS = [
  { id: 'trust', label: 'Итгэж болох', sub: 'Шууд гэрч, баталгаатай', col: 0x3fcf9a },
  { id: 'sus', label: 'Сэжигтэй', sub: 'Яаруулсан, тодорхойгүй, дуурайсан', col: 0xff8a5c },
  { id: 'irr', label: 'Хамааралгүй', sub: 'Нотолгоо биш', col: 0x9a8cc9 },
];
const SEVEN = ['Эх сурвалжийг шалга: хэн, хаана, хэзээ?', 'Хаяг, тамга, домэйныг шалга', 'Гарчгаас цааш унш', 'Иш татсан хүн бүрээс шалга', 'Олон талаас нь сонс', 'Баримт ба үзэл бодлыг ялга', 'Нотлох баримтыг өөрөө нягтал'];

const QUIZ = [
  { q: 'Тамга яагаад төстэй боловч өөр байсан бэ?', a: ['Харуул алдаа гаргасан', 'Хүмүүсийг хуурахын тулд албан ёсны нэрийг дуурайсан', 'Тамга хамаагүй'], ok: 1,
    why: 'Хуурамч мэдээ ихэвчлэн албан ёсны нэр, лого, тамгыг нэг үсгээр өөрчлөн дуурайдаг. НАРЛАГ → НАРЛААГ.' },
  { q: '"Миний бодлоор маш том байх" гэдэг нь баримт уу, үзэл бодол уу?', a: ['Баримт', 'Үзэл бодол'], ok: 1,
    why: '"Миний бодлоор", "байх" гэх үгс таамаг, бодлыг илэрхийлдэг. Баримтыг шалгаж, баталж болдог.' },
  { q: 'iconinews.club сайт "Цар тахлын улмаас иргэн бүрт сар бүр 300,000 төгрөг олгоно" гэж нийтэлжээ. Юуг хамгийн түрүүнд шалгах вэ?', a: ['Найзууддаа даруй хуваалцах', 'Сайтын домэйн хаяг, эзэмшигчийг (who.is) болон албан ёсны эх сурвалжийг', 'Хэдэн хүн лайк дарсныг'], ok: 1,
    why: 'Домэйн хаяг, эзэмшигчийг who.is-ээр шалгаж, засгийн газрын албан ёсны сайтаас батал. Лайкийн тоо үнэнийг баталдаггүй.' },
];
