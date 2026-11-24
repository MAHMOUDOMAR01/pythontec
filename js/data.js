/* =====================================================
   data.js — Quiz, Exam, Lab Examples & Module Names
   ===================================================== */

const MODULES = [
  "ما هي البرمجة؟","البدء مع Python","أول كود Python",
  "Variables & Data Types","User Input & Output","Operators",
  "Decision Making","Loops & Repetition","Lists",
  "Functions","Code Lab","Cybersecurity","المشروع التطبيقي","الاختبار النهائي"
];

const MODULE_ICONS = ['🌱','⚙️','👋','📦','🗣️','➕','🔀','🔁','📋','⚡','🧪','🔐','🚀','🏆'];

/* ---- Quiz questions per module (10 modules × 3 Qs) ---- */
const QUIZ_DATA = [
  /* 00 — What is Programming */
  [
    {q:"ما معنى كلمة Programming؟",
     opts:["تصفح الإنترنت","إعطاء الكمبيوتر تعليمات محددة","تصميم الجرافيك","تثبيت البرامج"],
     correct:1, fb:"البرمجة هي إعطاء الكمبيوتر تعليمات دقيقة ومحددة لتنفيذ مهام."},
    {q:"ماذا يفهم الكمبيوتر من تعليمات المبرمج؟",
     opts:["العربية مباشرة","Machine Code (0 و1) بعد الترجمة","الصور والأشكال","الأوامر الصوتية"],
     correct:1, fb:"الكمبيوتر يفهم فقط 0 و1، وPython تترجم كودك لهذه اللغة تلقائياً."},
    {q:"لماذا تُستخدم Python في الأمن السيبراني؟",
     opts:["لأنها الأسرع لغة","لأن لها مكتبات جاهزة وسهلة القراءة","تعمل فقط على Linux","لأنها مجانية فقط"],
     correct:1, fb:"Python لها مكتبات ضخمة للأمن السيبراني وهي سهلة القراءة."}
  ],
  /* 01 — Getting Started */
  [
    {q:"ما وظيفة Python Interpreter؟",
     opts:["تصميم واجهات المستخدم","قراءة الكود وتشغيله سطراً بسطر","تحويل الكود لملف تنفيذي","تصحيح الأخطاء فقط"],
     correct:1, fb:"الـ Interpreter يقرأ ويشغّل كود Python سطراً بسطر مباشرةً."},
    {q:"ما امتداد ملفات Python؟",
     opts:[".java",".py",".python",".txt"],
     correct:1, fb:"ملفات Python تنتهي بـ .py مثل script.py"},
    {q:"ما هو VS Code؟",
     opts:["نظام تشغيل","لغة برمجة","محرر أكواد مجاني ومتقدم","قاعدة بيانات"],
     correct:2, fb:"VS Code هو Code Editor مجاني من Microsoft، الأكثر شيوعاً بين المبرمجين."}
  ],
  /* 02 — First Code */
  [
    {q:'ما نتيجة: print("Hello")',
     opts:["تظهر رسالة خطأ","تُطبع كلمة Hello","تُطبع كلمة print","لا شيء"],
     correct:1, fb:"print() تطبع محتواها على الشاشة."},
    {q:"ما نوع البيانات في: 3.14",
     opts:["int","str","float","bool"],
     correct:2, fb:"الأعداد العشرية هي النوع float."},
    {q:'ما نتيجة تنفيذ: # print("Hello")',
     opts:["Hello","print(Hello)","خطأ","لا شيء يُطبع"],
     correct:3, fb:"السطر يبدأ بـ # لذا هو تعليق وPython تتجاهله تماماً."}
  ],
  /* 03 — Variables */
  [
    {q:'name = "Ahmed"\nprint(name)\nما الناتج؟',
     opts:["name","Ahmed",'"Ahmed"',"خطأ"],
     correct:1, fb:"المتغير name يحتوي على Ahmed، وprint(name) تطبع قيمته."},
    {q:"أي من التالي اسم متغير صحيح؟",
     opts:["2name","user name","user_age","class"],
     correct:2, fb:"user_age صحيح: يبدأ بحرف، لا فراغات، لا كلمات محجوزة."},
    {q:"ما نوع البيانات لـ: True",
     opts:["str","int","float","bool"],
     correct:3, fb:"True وFalse هما القيمتان الوحيدتان للنوع Boolean."}
  ],
  /* 04 — Input/Output */
  [
    {q:"ما نوع البيانات الذي تُرجعه input()؟",
     opts:["int","float","str","bool"],
     correct:2, fb:"input() دائماً تُرجع String حتى لو المستخدم كتب رقماً."},
    {q:'age = input("عمرك؟")\nكيف نحوّل age لرقم صحيح؟',
     opts:["number(age)","int(age)","integer(age)","convert(age)"],
     correct:1, fb:"int() تحوّل النص لعدد صحيح."},
    {q:'name = "أحمد"\nprint(f"مرحباً {name}")\nما الناتج؟',
     opts:["مرحباً {name}","مرحباً أحمد","خطأ","مرحباً name"],
     correct:1, fb:"f-string تضع قيمة المتغير داخل {} مباشرة."}
  ],
  /* 05 — Operators */
  [
    {q:"ما نتيجة: 10 % 3",
     opts:["3","0","1","3.33"],
     correct:2, fb:"% يعطي باقي القسمة. 10 ÷ 3 = 3 والباقي 1."},
    {q:"ما نتيجة: 2 ** 10",
     opts:["20","100","512","1024"],
     correct:3, fb:"** هو الأس. 2^10 = 1024"},
    {q:"ما نتيجة: 5 == 5",
     opts:["5","True","False","خطأ"],
     correct:1, fb:"== يقارن قيمتين. 5 تساوي 5 لذا النتيجة True."}
  ],
  /* 06 — Decisions */
  [
    {q:'age = 15\nif age >= 18:\n    print("بالغ")\nelse:\n    print("صغير")\nما الناتج؟',
     opts:["بالغ","صغير","خطأ","لا شيء"],
     correct:1, fb:"age=15 أصغر من 18، لذا الشرط False وينفّذ الـ else."},
    {q:"ما أهمية Indentation في Python؟",
     opts:["للجمال فقط","يحدد الكود الذي ينتمي للـ if/for/while","اختياري","للتعليق فقط"],
     correct:1, fb:"Python تستخدم المسافة البادئة بدلاً من {} لتحديد الكتل البرمجية."},
    {q:'x = 10\nif x > 5:\n    if x > 8:\n        print("A")\n    else:\n        print("B")\nما الناتج؟',
     opts:["A","B","AB","خطأ"],
     correct:0, fb:"x=10 > 5 ثم x=10 > 8 لذا تُطبع A."}
  ],
  /* 07 — Loops */
  [
    {q:'for i in range(3):\n    print(i)\nما الناتج؟',
     opts:["0 1 2 3","1 2 3","0 1 2","1 2"],
     correct:2, fb:"range(3) تعطي 0, 1, 2 (ثلاثة أرقام تبدأ من صفر)."},
    {q:"ما وظيفة break في الحلقة؟",
     opts:["تخطي دورة وتكمل","تخرج من الحلقة فوراً","تعيد تشغيل الحلقة","لا تأثير"],
     correct:1, fb:"break تخرج من الحلقة فوراً وتوقف التكرار."},
    {q:'count = 0\nwhile count < 3:\n    count += 1\nprint(count)\nما الناتج؟',
     opts:["0","2","3","4"],
     correct:2, fb:"الحلقة تكرر حتى count=3 ثم تتوقف. تطبع 3."}
  ],
  /* 08 — Lists */
  [
    {q:'fruits = ["apple","banana","cherry"]\nprint(fruits[1])\nما الناتج؟',
     opts:["apple","banana","cherry","خطأ"],
     correct:1, fb:"الـ Index يبدأ من صفر. [1]=banana."},
    {q:"كيف نضيف عنصر لنهاية List؟",
     opts:["list.add()","list.append()","list.insert()","list.push()"],
     correct:1, fb:"append() تضيف عنصراً لنهاية القائمة."},
    {q:'lst = [1,2,3,4,5]\nprint(len(lst))\nما الناتج؟',
     opts:["4","5","6","[1,2,3,4,5]"],
     correct:1, fb:"len() تُرجع عدد عناصر القائمة. القائمة تحتوي 5 عناصر."}
  ],
  /* 09 — Functions */
  [
    {q:"ما الكلمة المحجوزة لتعريف دالة في Python؟",
     opts:["function","func","def","define"],
     correct:2, fb:"def (اختصار define) هي الكلمة المحجوزة لتعريف الدوال."},
    {q:'def square(n):\n    return n * n\nprint(square(4))\nما الناتج؟',
     opts:["4","8","16","n*n"],
     correct:2, fb:"square(4) تُرجع 4*4 = 16."},
    {q:"ما وظيفة return في الدالة؟",
     opts:["تطبع النتيجة","تُرجع قيمة من الدالة","تنهي البرنامج","تكرر الدالة"],
     correct:1, fb:"return تُرجع قيمة من الدالة لتُستخدم في الكود الرئيسي."}
  ]
];

/* ---- Final Exam ---- */
const EXAM_QUESTIONS = [
  {type:"MCQ",           q:"ما نوع البيانات لـ: 42",
   opts:["str","int","float","bool"], correct:1, topic:"Data Types"},
  {type:"MCQ",           q:'ما ناتج: print("Hello" + " " + "World")',
   opts:["HelloWorld","Hello World","خطأ","Hello + World"], correct:1, topic:"Strings"},
  {type:"True/False",    q:"range(5) تعطي: 1, 2, 3, 4, 5",
   opts:["صحيح","خاطئ"], correct:1, fb:"range(5) تعطي 0,1,2,3,4 — تبدأ من صفر!", topic:"Loops"},
  {type:"Predict Output",q:'x = 10\nif x > 5:\n    print("كبير")\nelse:\n    print("صغير")',
   opts:["صغير","كبير","10","خطأ"], correct:1, topic:"Decisions"},
  {type:"MCQ",           q:"كيف نحوّل النص '25' لعدد صحيح؟",
   opts:["number('25')","int('25')","str('25')","float('25')"], correct:1, topic:"Type Conversion"},
  {type:"Find Error",    q:'fruits = ["apple","banana"]\nprint(fruits[2])',
   opts:["لا يوجد خطأ","IndexError: القائمة لها index 0 و1 فقط","SyntaxError","TypeError"],
   correct:1, topic:"Lists"},
  {type:"Predict Output",q:'for i in range(3):\n    print(i * 2)',
   opts:["0 2 4","2 4 6","0 1 2","1 2 3"], correct:0, topic:"Loops"},
  {type:"True/False",    q:"Python حساسة لحالة الحروف (Case Sensitive)",
   opts:["صحيح","خاطئ"], correct:0, fb:"print() مختلفة عن Print() وPRINT().", topic:"Basics"},
  {type:"MCQ",           q:'def greet(name):\n    return "Hello " + name\nprint(greet("Python"))',
   opts:["Hello","Hello Python","greet","خطأ"], correct:1, topic:"Functions"},
  {type:"Complete Code", q:'lst = [10, 20, 30]\nlst.___("40")\nما الدالة المناسبة؟',
   opts:["add","insert","append","push"], correct:2, topic:"Lists"},
  {type:"Predict Output",q:'x = 5\nx += 3\nprint(x)',
   opts:["5","3","8","53"], correct:2, topic:"Operators"},
  {type:"MCQ",           q:"ما وظيفة % في Python؟",
   opts:["ضرب","قسمة عادية","باقي القسمة","نسبة مئوية"], correct:2, topic:"Operators"},
  {type:"True/False",    q:"المتغير التالي صحيح: 2name = 'Ali'",
   opts:["صحيح","خاطئ"], correct:1, fb:"المتغيرات لا تبدأ برقم — SyntaxError.", topic:"Variables"},
  {type:"Find Error",    q:'score = 85\nif score >= 90\n    print("ممتاز")',
   opts:["لا خطأ","SyntaxError: نقطتان مفقودتان بعد الشرط","IndentationError","NameError"],
   correct:1, topic:"Decisions"},
  {type:"MCQ",           q:'ما ناتج: len(["a","b","c","d"])',
   opts:["3","4","5","خطأ"], correct:1, topic:"Lists"}
];

/* ---- Lab Examples ---- */
const LAB_EXAMPLES = [
`# Hello World الكلاسيكي
print("Hello, World!")
print("مرحباً بالعالم!")
print("أهلاً Python 🐍")`,

`# المتغيرات وأنواع البيانات
name = "أحمد"
age = 22
height = 1.75
is_student = True

print(f"الاسم: {name}")
print(f"العمر: {age}")
print(f"الطول: {height} متر")
print(f"طالب؟ {is_student}")`,

`# حلقة for
for i in range(1, 6):
    if i % 2 == 0:
        print(f"العدد {i}: زوجي")
    else:
        print(f"العدد {i}: فردي")`,

`# القوائم
colors = ["أحمر", "أخضر", "أزرق"]
colors.append("أصفر")
for i in range(len(colors)):
    print(f"{i}: {colors[i]}")
print("العدد الكلي:", len(colors))`,

`# الدوال
def greet(name, msg="مرحباً"):
    return msg + " " + name + "!"

print(greet("أحمد"))
print(greet("سارة", "أهلاً"))
print(greet("محمود", "مرحبتين"))`,

`# FizzBuzz
for i in range(1, 21):
    if i % 15 == 0:
        print("FizzBuzz")
    elif i % 3 == 0:
        print("Fizz")
    elif i % 5 == 0:
        print("Buzz")
    else:
        print(i)`,

`# مجموع الأرقام من 1 إلى 100
total = 0
for i in range(1, 101):
    total += i
print(f"مجموع 1 إلى 100 = {total}")`,

`# قلب النص
def reverse_text(text):
    reversed_text = ""
    for char in text:
        reversed_text = char + reversed_text
    return reversed_text

words = ["Python", "Security", "Hello"]
for word in words:
    print(f"{word} -> {reverse_text(word)}")`,

`# الأعداد الأولية
def is_prime(n):
    if n < 2:
        return False
    for i in range(2, n):
        if n % i == 0:
            return False
    return True

primes = []
for n in range(2, 30):
    if is_prime(n):
        primes.append(n)
print("الأعداد الأولية حتى 30:")
print(primes)`,

`# فاحص قوة كلمة المرور
def check_strength(pwd):
    score = 0
    if len(pwd) >= 8:
        score += 1
    for c in pwd:
        if c.isupper():
            score += 1
            break
    for c in pwd:
        if c.isdigit():
            score += 1
            break
    for c in pwd:
        if c in "!@#$%":
            score += 1
            break
    levels = ["🔴 ضعيفة جداً","🟠 ضعيفة","🟡 متوسطة","🟢 جيدة","💪 قوية جداً"]
    return levels[score]

passwords = ["123", "hello", "Hello1", "Hello1!", "MyStr0ng!"]
for p in passwords:
    print(f"{p}: {check_strength(p)}")`
];
