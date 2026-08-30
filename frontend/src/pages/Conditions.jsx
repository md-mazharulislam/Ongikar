import "./Settings.css";

export default function Conditions() {
  return (
    <div className="page-w">
      <h1 className="page-title">শর্তাবলী</h1>
      <p className="page-description">অঙ্গীকার প্ল্যাটফর্ম ব্যবহারের নিয়মাবলী</p>

      <div className="card mb-3">
        <h2 className="mb-2">১. অ্যাকাউন্ট</h2>
        <p className="muted" style={{ lineHeight: 1.8 }}>
          অঙ্গীকারে অ্যাকাউন্ট তৈরি করতে হলে সঠিক তথ্য প্রদান করতে হবে। প্রদত্ত ফোন নম্বর ও পাসওয়ার্ডের
          সুরক্ষার দায়িত্ব সম্পূর্ণভাবে ব্যবহারকারীর।
        </p>
      </div>

      <div className="card mb-3">
        <h2 className="mb-2">২. ওয়ালেট ও লেনদেন</h2>
        <p className="muted" style={{ lineHeight: 1.8 }}>
          ওয়ালেটে যোগ করা অর্থ শুধুমাত্র প্ল্যাটফর্মের অনুমোদিত সেবাসমূহে ব্যবহার করা যাবে। ভুল তথ্য দিয়ে
          করা লেনদেনের জন্য অঙ্গীকার দায়ী থাকবে না।
        </p>
      </div>

      <div className="card mb-3">
        <h2 className="mb-2">৩. উপকরণ বিনিময়</h2>
        <p className="muted" style={{ lineHeight: 1.8 }}>
          জমাকৃত উপকরণের গুণমান যাচাই সাপেক্ষে মূল্য নির্ধারণ করা হয়। ভুল বা মানহীন উপকরণ জমা দিলে
          তা প্রত্যাখ্যান করার অধিকার কর্তৃপক্ষ সংরক্ষণ করে।
        </p>
      </div>

      <div className="card">
        <h2 className="mb-2">৪. গোপনীয়তা</h2>
        <p className="muted" style={{ lineHeight: 1.8 }}>
          ব্যবহারকারীর ব্যক্তিগত তথ্য এনক্রিপ্ট করে সংরক্ষণ করা হয় এবং তৃতীয় পক্ষের সাথে শেয়ার করা হয় না,
          আইনি বাধ্যবাধকতা ব্যতীত।
        </p>
      </div>
    </div>
  );
}
