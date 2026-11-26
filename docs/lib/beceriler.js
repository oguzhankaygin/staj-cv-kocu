// İlk değer ekranda gösterilen ad, ardından aynı becerinin diğer yazımları gelir.
const gruplar = {
  Yazılım: `JavaScript|JS
TypeScript|TS
Python
Java
C
C++
C#|C sharp
.NET|dotnet
Go|Golang
Rust
PHP
Ruby
Kotlin
Swift
SQL
HTML|HTML5
CSS|CSS3
React|React.js
Vue|Vue.js
Angular
Node.js|NodeJS
Express|Express.js
Django
Flask
FastAPI
Spring Boot
Laravel
Git
GitHub
GitLab
Docker
Kubernetes|K8s
Linux
Bash
REST API|RESTful API
GraphQL
PostgreSQL|Postgres
MySQL
MongoDB
Redis
Birim testi|unit testing|unit test
Entegrasyon testi|integration testing
CI/CD|continuous integration continuous delivery
AWS|Amazon Web Services
Azure
Google Cloud|GCP
Firebase
Selenium
Playwright
Jest
OAuth
Web erişilebilirliği|web accessibility|WCAG`,
  Veri: `Veri analizi|data analysis
Veri görselleştirme|data visualization
Veri temizleme|data cleaning
Makine öğrenmesi|machine learning
Derin öğrenme|deep learning
Doğal dil işleme|natural language processing|NLP
Bilgisayarlı görü|computer vision
İstatistik|statistics
Olasılık|probability
Regresyon|regression
Zaman serisi|time series
A/B testi|A/B testing
Excel|Microsoft Excel
Google Sheets
Power BI
Tableau
Looker Studio
Pandas
NumPy
Jupyter|Jupyter Notebook
scikit-learn|sklearn
TensorFlow
PyTorch
Spark|Apache Spark
ETL
Veri modelleme|data modeling
BigQuery`,
  Tasarım: `Figma
Adobe Photoshop|Photoshop
Adobe Illustrator|Illustrator
InDesign
After Effects
Blender
Canva
Kullanıcı deneyimi|UX|user experience
Kullanıcı arayüzü|UI|user interface
Kullanıcı araştırması|user research
Kullanılabilirlik testi|usability testing
Prototipleme|prototyping
Wireframe
Tasarım sistemi|design system
Tipografi|typography
Görsel tasarım|visual design
Marka kimliği|brand identity
Hareketli grafik|motion graphics`,
  Pazarlama: `SEO|arama motoru optimizasyonu
SEM|search engine marketing
Google Ads
Meta Ads
Google Analytics|GA4
İçerik pazarlaması|content marketing
Sosyal medya yönetimi|social media management
E-posta pazarlaması|email marketing
Metin yazarlığı|copywriting
Pazar araştırması|market research
Rakip analizi|competitive analysis
Kampanya yönetimi|campaign management
Dönüşüm optimizasyonu|conversion rate optimization
CRM|müşteri ilişkileri yönetimi
HubSpot
Salesforce
Mailchimp`,
  Mühendislik: `AutoCAD
SolidWorks
CATIA
ANSYS
MATLAB
Simulink
Fusion 360
Teknik çizim|technical drawing
Bilgisayar destekli tasarım|CAD
Sonlu elemanlar analizi|FEA
PLC|programlanabilir lojik kontrolör
SCADA
Arduino
Raspberry Pi
Gömülü sistemler|embedded systems
Devre tasarımı|circuit design
PCB tasarımı|PCB design
Kalite kontrol|quality control
Yalın üretim|lean manufacturing
Altı sigma|six sigma
Üretim planlama|production planning
Tedarik zinciri|supply chain
3D baskı|3D printing`,
  Finans: `Finansal analiz|financial analysis
Finansal modelleme|financial modeling
Bütçeleme|budgeting
Muhasebe|accounting
Nakit akışı|cash flow
Değerleme|valuation
Risk yönetimi|risk management
İç denetim|internal audit
Maliyet analizi|cost analysis
Finansal raporlama|financial reporting
IFRS|UFRS
SAP
ERP|kurumsal kaynak planlama
Mutabakat|reconciliation
Portföy yönetimi|portfolio management
Vergi muhasebesi|tax accounting`,
  'Genel yetkinlikler': `Takım çalışması|ekip çalışması|teamwork|team work
İletişim becerisi|iletişim becerileri|communication skills
Problem çözme|sorun çözme|problem solving
Zaman yönetimi|time management
Proje yönetimi|project management
Liderlik|leadership
Sunum becerisi|sunum becerileri|presentation skills
Analitik düşünme|analytical thinking
Eleştirel düşünme|critical thinking
Paydaş yönetimi|stakeholder management
Dokümantasyon|documentation
İngilizce|English
Almanca|German
Agile|çevik çalışma
Scrum
Kanban
Jira
Araştırma becerisi|research skills
Müzakere|negotiation
Çatışma yönetimi|conflict management`,
};

export const beceriler = Object.entries(gruplar).flatMap(([kategori, metin]) =>
  metin.split('\n').map(satir => {
    const [ad, ...diger] = satir.split('|');
    return { ad, kategori, adlar: [ad, ...diger] };
  })
);
