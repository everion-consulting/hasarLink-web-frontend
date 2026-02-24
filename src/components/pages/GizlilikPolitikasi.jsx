import React from "react";

export default function GizlilikPolitikasi() {
  return (
    <div style={styles.page}>
      <div style={styles.card}>
        {/* HEADER */}
        <div style={styles.header}>
          <h1 style={styles.title}>Gizlilik Politikası</h1>
          <p style={styles.subtitle}>Son güncelleme: 6 Şubat 2026</p>
        </div>

        {/* CONTENT */}
        <div style={styles.content}>
          <div style={styles.intro}>
            <p style={styles.text}>
              <strong>HasarLink</strong> olarak kişisel verilerinizin korunmasına büyük önem
              veriyoruz. Bu gizlilik politikası, mobil uygulamamız ve hizmetlerimiz aracılığıyla
              toplanan verilerin nasıl işlendiği, saklandığı ve korunduğu hakkında sizi
              bilgilendirmek amacıyla hazırlanmıştır.
            </p>
          </div>

          <Section title="1. Veri Sorumlusu">
            <p style={styles.text}><strong>Şirket Adı:</strong> Everion Consulting</p>
            <p style={styles.text}><strong>E-posta:</strong> bilgi@hasarlink.com</p>
            <p style={styles.text}><strong>Web Sitesi:</strong> hasarlink.com</p>
          </Section>

          <Section title="2. Toplanan Kişisel Veriler">
            <SubTitle>2.1 Kimlik ve İletişim Bilgileri</SubTitle>
            <Bullet>Ad soyad</Bullet>
            <Bullet>E-posta adresi</Bullet>
            <Bullet>Telefon numarası</Bullet>
            <Bullet>Kullanıcı adı</Bullet>
            <Bullet>TC Kimlik Numarası (dosya işlemleri için)</Bullet>

            <SubTitle>2.2 Hesap Bilgileri</SubTitle>
            <Bullet>Şifre (şifreli olarak saklanır)</Bullet>
            <Bullet>Firebase UID (sosyal medya girişi için)</Bullet>
            <Bullet>Kimlik doğrulama sağlayıcısı bilgileri (Google, Apple vb.)</Bullet>

            <SubTitle>2.3 Dosya ve Başvuru Bilgileri</SubTitle>
            <Bullet>Sigorta başvuru dosyaları ve belgeleri</Bullet>
            <Bullet>Hasar fotoğrafları ve belgeleri</Bullet>
            <Bullet>Araç ve sigorta bilgileri</Bullet>

            <SubTitle>2.4 Cihaz ve Teknik Bilgiler</SubTitle>
            <Bullet>Cihaz türü ve platform bilgisi (Android / iOS)</Bullet>
            <Bullet>IP adresi</Bullet>
            <Bullet>FCM cihaz tokeni (bildirimler için)</Bullet>
            <Bullet>Son giriş zamanı</Bullet>
          </Section>

          <Section title="3. Verilerin Toplanma Amacı">
            <Bullet>Hesap oluşturma ve kimlik doğrulama işlemleri</Bullet>
            <Bullet>Sigorta dosyası ve hasar başvurusu yönetimi</Bullet>
            <Bullet>Push bildirim gönderimi</Bullet>
            <Bullet>Kullanıcı desteği ve iletişim</Bullet>
            <Bullet>Hizmet kalitesinin iyileştirilmesi</Bullet>
            <Bullet>Yasal yükümlülüklerin yerine getirilmesi</Bullet>
          </Section>

          <Section title="4. Verilerin Saklanması ve Güvenlik">
            <Bullet>Şifreler bcrypt ile hashlenerek saklanır</Bullet>
            <Bullet>Veriler SSL/TLS ile şifreli iletişim üzerinden aktarılır</Bullet>
            <Bullet>Dosyalar DigitalOcean Spaces üzerinde şifreli olarak depolanır</Bullet>
            <Bullet>Erişimler rol tabanlı yetkilendirme ile korunur</Bullet>
            <Bullet>API istekleri token tabanlı kimlik doğrulama ile sağlanır</Bullet>
          </Section>

          <Section title="5. Verilerin Paylaşılması">
            <Bullet><strong>Sigorta şirketleri:</strong> Dosya ve başvuru işlemleri kapsamında</Bullet>
            <Bullet><strong>Bulut hizmet sağlayıcıları:</strong> DigitalOcean, Firebase</Bullet>
            <Bullet><strong>Yasal zorunluluklar:</strong> Mahkeme veya resmi makamlar</Bullet>
          </Section>

          <Section title="6. Kullanıcı Hakları (KVKK Madde 11)">
            <Bullet>Kişisel verilerinizin işlenip işlenmediğini öğrenme</Bullet>
            <Bullet>İşlenmişse buna ilişkin bilgi talep etme</Bullet>
            <Bullet>Amacına uygun kullanılıp kullanılmadığını öğrenme</Bullet>
            <Bullet>Yurt içi / yurt dışı aktarım bilgisi isteme</Bullet>
            <Bullet>Eksik veya yanlış işlenmişse düzeltilmesini isteme</Bullet>
            <Bullet>KVKK 7. madde kapsamında silinmesini isteme</Bullet>
            <Bullet>Otomatik analizlere itiraz etme</Bullet>
            <Bullet>Zarar halinde tazminat talep etme</Bullet>
          </Section>

          <Section title="7. Hesap ve Veri Silme">
            <div style={styles.infoBox}>
              <p style={styles.text}>
                Hesabınızı ve kişisel verilerinizi silmek için uygulama içinden
                <strong> Ayarlar → Hesabımı Sil </strong>
                adımını kullanabilir veya
                <strong> bilgi@hasarlink.com </strong>
                adresine e-posta gönderebilirsiniz.
                Silme talepleri en geç <strong>30 gün</strong> içinde işlenir.
              </p>
            </div>
            <Bullet>Profil ve hesap verileri</Bullet>
            <Bullet>Cihaz tokenları ve bildirim ayarları</Bullet>
            <Bullet>Başvuru geçmişi</Bullet>
          </Section>

          <Section title="8. Çerezler ve İzleme Teknolojileri">
            <p style={styles.text}>
              Mobil uygulamamız çerez kullanmaz. Ancak Firebase Analytics gibi
              üçüncü parti hizmetler aracılığıyla anonim kullanım istatistikleri
              toplanabilir.
            </p>
          </Section>

          <Section title="9. Çocukların Gizliliği">
            <p style={styles.text}>
              Hizmetlerimiz 18 yaş altı bireylere yönelik değildir.
              Bilerek 18 yaş altından veri toplanmaz.
            </p>
          </Section>

          <Section title="10. Gizlilik Politikası Değişiklikleri">
            <p style={styles.text}>
              Gizlilik politikası zaman zaman güncellenebilir.
              Güncel versiyon her zaman bu sayfa üzerinden erişilebilir.
            </p>
          </Section>

          <Section title="11. İletişim">
            <div style={styles.contact}>
              <p style={styles.text}><strong>E-posta:</strong> bilgi@hasarlink.com</p>
              <p style={styles.text}><strong>Şirket:</strong> Everion Consulting</p>
            </div>
          </Section>
        </div>

        <p style={styles.footer}>© 2026 HasarLink – Everion Consulting</p>
      </div>
    </div>
  );
}

/* Helper Components */
function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <h2 style={styles.sectionTitle}>{title}</h2>
      {children}
    </div>
  );
}

function SubTitle({ children }) {
  return <h3 style={styles.subTitle}>{children}</h3>;
}

function Bullet({ children }) {
  return <p style={styles.bullet}>• {children}</p>;
}

/* Styles */
const styles = {
  page: {
    minHeight: "100vh",
    backgroundColor: "#f6f9fc",
    padding: "20px",
  },
  card: {
    maxWidth: 800,
    margin: "0 auto",
    backgroundColor: "#fff",
    borderRadius: 12,
    overflow: "hidden",
    boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
  },
  header: {
    backgroundColor: "#0f3c6e",
    padding: "32px 28px",
  },
  title: {
    color: "#fff",
    fontSize: 26,
    fontWeight: 700,
    margin: 0,
  },
  subtitle: {
    color: "#e5e7eb",
    marginTop: 6,
    fontSize: 14,
    margin: "6px 0 0 0",
  },
  content: {
    padding: "28px 28px 8px",
  },
  intro: {
    backgroundColor: "#f1f6fb",
    padding: 18,
    borderLeft: "4px solid #0f3c6e",
    marginBottom: 28,
    borderRadius: "0 8px 8px 0",
  },
  text: {
    fontSize: 15,
    lineHeight: 1.7,
    marginBottom: 6,
    color: "#333",
    margin: "0 0 6px 0",
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: 700,
    color: "#0f3c6e",
    marginBottom: 10,
    margin: "0 0 10px 0",
  },
  subTitle: {
    fontSize: 16,
    fontWeight: 600,
    marginTop: 14,
    marginBottom: 8,
    color: "#333",
    margin: "14px 0 8px 0",
  },
  bullet: {
    fontSize: 15,
    lineHeight: 1.7,
    marginBottom: 4,
    color: "#333",
    margin: "0 0 4px 0",
  },
  infoBox: {
    backgroundColor: "#f1f6fb",
    padding: 16,
    borderLeft: "4px solid #0f3c6e",
    marginBottom: 14,
    borderRadius: "0 8px 8px 0",
  },
  contact: {
    backgroundColor: "#f1f6fb",
    padding: 18,
    borderRadius: 8,
  },
  footer: {
    textAlign: "center",
    padding: 20,
    fontSize: 13,
    color: "#6b7280",
    margin: 0,
  },
};
