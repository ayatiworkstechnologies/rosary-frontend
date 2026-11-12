"use client";

import {

  useEffect,

  useState,

} from "react";

import Image from "next/image";

import {

  BriefcaseBusiness,

  Home,

  Loader2,

  Mail,

  MapPin,

  Phone,

  School,

  ShieldCheck,

  BadgeCheck,

  BellRing,

  CircleAlert,

  Send,

  UserRound,

  Users,

} from "lucide-react";

import {

  getParentProfile,

} from "@/services/parentService";

import {
  getParentEmailPreferences,
  requestParentEmailVerification,
  updateParentEmailPreferences,
} from "@/services/parentEmailService";

const passthroughImageLoader = ({ src }) => src;

// =========================================================

// PAGE

// =========================================================

export default function ParentProfilePage() {

  const [

    profile,

    setProfile,

  ] = useState(null);

  const [

    loading,

    setLoading,

  ] = useState(true);

  const [

    error,

    setError,

  ] = useState("");

  const [emailPreferences, setEmailPreferences] = useState(null);
  const [emailLoading, setEmailLoading] = useState(true);
  const [emailError, setEmailError] = useState("");
  const [emailNotice, setEmailNotice] = useState("");
  const [verificationSending, setVerificationSending] = useState(false);
  const [preferenceSaving, setPreferenceSaving] = useState(false);

  // =======================================================

  // LOAD PROFILE

  // =======================================================

  useEffect(() => {

    let cancelled = false;

    async function loadProfile() {
      try {
        // Keep these sequential. The profile is the primary page payload and
        // must remain usable when the optional preferences request fails.
        const data = await getParentProfile();

        if (cancelled) {
          return;
        }
        setProfile(data);
        setError("");
      } catch (err) {
        if (!cancelled) {
          setError(err?.response?.data?.detail || "Unable to load profile.");
          setEmailLoading(false);
        }
        return;
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }

      if (cancelled) return;
      try {
        const preferences = await getParentEmailPreferences();
        if (!cancelled) {
          setEmailPreferences(preferences);
          setEmailError("");
        }
      } catch (err) {
        if (!cancelled) setEmailError(emailErrorMessage(err));
      } finally {
        if (!cancelled) setEmailLoading(false);
      }

    }

    loadProfile();

    return () => {

      cancelled = true;

    };

  }, []);

  async function refreshEmailPreferences() {
    const data = await getParentEmailPreferences();
    setEmailPreferences(data);
    return data;
  }

  async function handleVerificationRequest() {
    if (verificationSending || !emailPreferences?.email) return;
    setVerificationSending(true);
    setEmailError("");
    setEmailNotice("");
    try {
      const result = await requestParentEmailVerification();
      setEmailNotice(
        result?.message || "Verification email sent. Please check your inbox."
      );
      await refreshEmailPreferences();
    } catch (err) {
      setEmailError(emailErrorMessage(err));
    } finally {
      setVerificationSending(false);
    }
  }

  async function handlePreferenceChange(event) {
    const enabled = event.target.checked;
    if (preferenceSaving) return;
    setPreferenceSaving(true);
    setEmailError("");
    setEmailNotice("");
    try {
      await updateParentEmailPreferences(enabled);
      const saved = await refreshEmailPreferences();
      setEmailNotice(
        saved.email_notifications_enabled
          ? "Email notifications have been enabled."
          : "Email notifications have been disabled."
      );
    } catch (err) {
      setEmailError(emailErrorMessage(err));
      try {
        await refreshEmailPreferences();
      } catch {
        // Keep the last confirmed server state if refresh also fails.
      }
    } finally {
      setPreferenceSaving(false);
    }
  }

  // =======================================================

  // LOADING

  // =======================================================

  if (loading) {

    return (

      <LoadingState />

    );

  }

  // =======================================================

  // ERROR

  // =======================================================

  if (error) {

    return (

      <div

        className="

          rounded-2xl

          border

          border-red-200

          bg-red-50

          p-5

          text-sm

          text-red-600

        "

      >

        {error}

      </div>

    );

  }

  if (!profile) {

    return null;

  }

  // =======================================================

  // INITIALS

  // =======================================================

  const initials =

    profile.name

      ?.split(" ")

      .filter(Boolean)

      .map(

        (item) =>

          item[0]

      )

      .slice(0, 2)

      .join("")

      .toUpperCase() ||

    "P";

  return (

    <div

      className="

        mx-auto

        max-w-[1200px]

      "

    >

      {/* HEADER */}

      <div>

        <h1

          className="

            text-2xl

            font-bold

            text-[#0B3A67]

          "

        >

          My Profile

        </h1>

        <p

          className="

            mt-1

            text-sm

            text-slate-500

          "

        >

          View your account,

          contact information and

          linked children.

        </p>

      </div>

      {/* PROFILE HERO */}

      <section

        className="

          mt-6

          overflow-hidden

          rounded-2xl

          border

          border-[#E4EDF7]

          bg-white

          shadow-sm

        "

      >

        <div

          className="

            h-[105px]

            bg-gradient-to-r

            from-[#0075FF]

            to-[#0B3A67]

          "

        />

        <div

          className="

            px-5

            pb-5

            sm:px-6

          "

        >

          <div

            className="

              flex

              flex-col

              gap-4

              sm:flex-row

              sm:items-end

              sm:justify-between

            "

          >

            <div

              className="

                -mt-10

                flex

                flex-col

                gap-3

                sm:flex-row

                sm:items-end

              "

            >

              {/* PHOTO */}

              {profile.profile_image_url ? (

                <Image

                  loader={passthroughImageLoader}

                  src={

                    profile.profile_image_url

                  }

                  alt={

                    profile.name

                  }

                  width={80}

                  height={80}

                  unoptimized

                  className="

                    h-20

                    w-20

                    rounded-2xl

                    border-4

                    border-white

                    object-cover

                    shadow-md

                  "

                />

              ) : (

                <div

                  className="

                    flex

                    h-20

                    w-20

                    items-center

                    justify-center

                    rounded-2xl

                    border-4

                    border-white

                    bg-[#EAF4FF]

                    text-xl

                    font-bold

                    text-[#0075FF]

                    shadow-md

                  "

                >

                  {initials}

                </div>

              )}

              <div

                className="

                  pb-1

                "

              >

                <h2

                  className="

                    text-xl

                    font-bold

                    text-[#0B3A67]

                  "

                >

                  {profile.name}

                </h2>

                <p

                  className="

                    mt-1

                    text-sm

                    text-slate-500

                  "

                >

                  Parent Account

                </p>

              </div>

            </div>

            {/* STATUS */}

            <div

              className={`

                inline-flex

                w-fit

                items-center

                gap-2

                rounded-full

                px-3

                py-1.5

                text-xs

                font-semibold

                ${

                  profile.is_active

                    ? "bg-green-50 text-green-600"

                    : "bg-red-50 text-red-500"

                }

              `}

            >

              <ShieldCheck

                size={14}

              />

              {

                profile.is_active

                  ? "Active Account"

                  : "Inactive Account"

              }

            </div>

          </div>

        </div>

      </section>

      {/* INFORMATION */}

      <div

        className="

          mt-5

          grid

          gap-5

          lg:grid-cols-2

        "

      >

        {/* ACCOUNT */}

        <ProfileSection

          title="Account Information"

          icon={UserRound}

        >

          <ProfileField

            icon={UserRound}

            label="Username"

            value={

              profile.username

            }

          />

          <ProfileField

            icon={Mail}

            label="Email"

            value={

              profile.email ||

              "--"

            }

          />

          <ProfileField

            icon={Phone}

            label="Phone"

            value={

              profile.phone ||

              "--"

            }

          />

          <ProfileField

            icon={Phone}

            label="Alternate Phone"

            value={

              profile.alternate_phone ||

              "--"

            }

          />

        </ProfileSection>

        {/* PERSONAL */}

        <ProfileSection

          title="Personal Information"

          icon={

            BriefcaseBusiness

          }

        >

          <ProfileField

            icon={

              BriefcaseBusiness

            }

            label="Occupation"

            value={

              profile.occupation ||

              "--"

            }

          />

          <ProfileField

            icon={Home}

            label="Address"

            value={

              profile.address ||

              "--"

            }

          />

          <ProfileField

            icon={MapPin}

            label="City"

            value={

              profile.city ||

              "--"

            }

          />

          <ProfileField

            icon={MapPin}

            label="State / Pincode"

            value={

              [

                profile.state,

                profile.pincode,

              ]

                .filter(Boolean)

                .join(" - ") ||

              "--"

            }

          />

        </ProfileSection>

      </div>

      <EmailNotificationSection
        preferences={emailPreferences}
        loading={emailLoading}
        error={emailError}
        notice={emailNotice}
        verificationSending={verificationSending}
        preferenceSaving={preferenceSaving}
        onVerify={handleVerificationRequest}
        onPreferenceChange={handlePreferenceChange}
      />

      {/* LINKED CHILDREN */}

      <section

        className="

          mt-5

          rounded-2xl

          border

          border-[#E4EDF7]

          bg-white

          p-5

          shadow-sm

        "

      >

        <div

          className="

            flex

            items-center

            gap-3

          "

        >

          <div

            className="

              flex

              h-10

              w-10

              items-center

              justify-center

              rounded-xl

              bg-[#EAF4FF]

              text-[#0075FF]

            "

          >

            <Users

              size={19}

            />

          </div>

          <div>

            <h2

              className="

                font-bold

                text-[#0B3A67]

              "

            >

              My Children

            </h2>

            <p

              className="

                mt-0.5

                text-xs

                text-slate-400

              "

            >

              Students linked to

              your parent account.

            </p>

          </div>

        </div>

        {profile.children

          ?.length > 0 ? (

          <div

            className="

              mt-5

              grid

              gap-3

              sm:grid-cols-2

              lg:grid-cols-3

            "

          >

            {profile.children.map(

              (child) => (

                <ChildCard

                  key={

                    child.student_id

                  }

                  child={

                    child

                  }

                />

              )

            )}

          </div>

        ) : (

          <div

            className="

              mt-5

              rounded-xl

              bg-[#F8FBFF]

              py-10

              text-center

            "

          >

            <Users

              size={30}

              className="

                mx-auto

                text-slate-300

              "

            />

            <p

              className="

                mt-2

                text-sm

                text-slate-400

              "

            >

              No children linked.

            </p>

          </div>

        )}

      </section>

    </div>

  );

}

function EmailNotificationSection({
  preferences,
  loading,
  error,
  notice,
  verificationSending,
  preferenceSaving,
  onVerify,
  onPreferenceChange,
}) {
  const hasEmail = Boolean(preferences?.email);
  const verified = Boolean(preferences?.email_verified_at);
  const toggleDisabled = loading || !verified || preferenceSaving;

  return (
    <section className="mt-5 rounded-2xl border border-[#E4EDF7] bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EAF4FF] text-[#0075FF]">
          <BellRing size={19} />
        </div>
        <div>
          <h2 className="font-bold text-[#0B3A67]">Email Notifications &amp; Verification</h2>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            Verify your registered address before choosing optional school email updates.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="mt-5 flex min-h-24 items-center justify-center rounded-xl bg-[#F8FBFF] text-sm text-slate-500" role="status">
          <Loader2 size={18} className="mr-2 animate-spin text-[#0075FF]" />
          Loading email preferences...
        </div>
      ) : (
        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          <div className="rounded-xl border border-[#E4EDF7] bg-[#F8FBFF] p-4">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Registered Email</p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <p className="min-w-0 break-all text-sm font-semibold text-[#0B3A67]">
                {preferences?.email || "No email address registered"}
              </p>
              {hasEmail && (
                <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold ${verified ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"}`}>
                  {verified ? <BadgeCheck size={14} /> : <CircleAlert size={14} />}
                  {verified ? "Verified" : "Unverified"}
                </span>
              )}
            </div>
            {!hasEmail ? (
              <p className="mt-3 text-xs leading-5 text-slate-500">Ask the school office to add an email address to your parent account.</p>
            ) : !verified ? (
              <button
                type="button"
                onClick={onVerify}
                disabled={verificationSending}
                className="mt-4 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#0075FF] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#0066DD] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0075FF] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {verificationSending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                {verificationSending ? "Sending..." : "Send verification email"}
              </button>
            ) : (
              <p className="mt-3 text-xs leading-5 text-green-700">Your address is ready for optional email notifications.</p>
            )}
          </div>

          <div className="rounded-xl border border-[#E4EDF7] p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <label htmlFor="parent-email-notifications" className="text-sm font-bold text-[#0B3A67]">Optional email notifications</label>
                <p id="parent-email-notifications-help" className="mt-1 text-xs leading-5 text-slate-500">
                  Receive eligible homework, attendance, result, circular, event and fee updates.
                </p>
              </div>
              <input
                id="parent-email-notifications"
                type="checkbox"
                role="switch"
                aria-describedby="parent-email-notifications-help"
                aria-checked={Boolean(preferences?.email_notifications_enabled)}
                checked={Boolean(preferences?.email_notifications_enabled)}
                disabled={toggleDisabled}
                onChange={onPreferenceChange}
                className="mt-1 h-5 w-9 shrink-0 cursor-pointer accent-[#0075FF] disabled:cursor-not-allowed"
              />
            </div>
            {!verified && (
              <p className="mt-3 text-xs font-medium text-amber-700">Verification is required before this preference can be enabled.</p>
            )}
            {preferenceSaving && (
              <p className="mt-3 flex items-center gap-2 text-xs text-slate-500" role="status"><Loader2 size={14} className="animate-spin" />Saving preference...</p>
            )}
          </div>
        </div>
      )}

      {notice && <p className="mt-4 rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-700" role="status">{notice}</p>}
      {error && <p className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700" role="alert">{error}</p>}
    </section>
  );
}

function emailErrorMessage(error) {
  const detail = error?.response?.data?.detail;
  if (typeof detail === "string" && detail.trim()) return detail;
  if (error?.message?.startsWith("Cannot connect to backend")) {
    return "Unable to connect to the school server. Please try again."
  }
  return "Unable to update email settings. Please try again."
}

// =========================================================

// PROFILE SECTION

// =========================================================

function ProfileSection({

  title,

  icon: Icon,

  children,

}) {

  return (

    <section

      className="

        rounded-2xl

        border

        border-[#E4EDF7]

        bg-white

        p-5

        shadow-sm

      "

    >

      <div

        className="

          mb-4

          flex

          items-center

          gap-3

        "

      >

        <div

          className="

            flex

            h-10

            w-10

            items-center

            justify-center

            rounded-xl

            bg-[#EAF4FF]

            text-[#0075FF]

          "

        >

          <Icon

            size={19}

          />

        </div>

        <h2

          className="

            font-bold

            text-[#0B3A67]

          "

        >

          {title}

        </h2>

      </div>

      <div

        className="

          divide-y

          divide-slate-100

        "

      >

        {children}

      </div>

    </section>

  );

}

// =========================================================

// PROFILE FIELD

// =========================================================

function ProfileField({

  icon: Icon,

  label,

  value,

}) {

  return (

    <div

      className="

        flex

        items-start

        gap-3

        py-3

        first:pt-0

        last:pb-0

      "

    >

      <div

        className="

          flex

          h-9

          w-9

          shrink-0

          items-center

          justify-center

          rounded-lg

          bg-[#F8FBFF]

          text-[#0075FF]

        "

      >

        <Icon

          size={16}

        />

      </div>

      <div

        className="

          min-w-0

        "

      >

        <p

          className="

            text-[10px]

            font-medium

            uppercase

            tracking-wide

            text-slate-400

          "

        >

          {label}

        </p>

        <p

          className="

            mt-1

            break-words

            text-sm

            font-semibold

            text-[#0B3A67]

          "

        >

          {value}

        </p>

      </div>

    </div>

  );

}

// =========================================================

// CHILD

// =========================================================

function ChildCard({

  child,

}) {

  return (

    <div

      className="

        rounded-xl

        border

        border-[#E4EDF7]

        bg-[#F8FBFF]

        p-4

      "

    >

      <div

        className="

          flex

          items-start

          gap-3

        "

      >

        <div

          className="

            flex

            h-10

            w-10

            shrink-0

            items-center

            justify-center

            rounded-xl

            bg-white

            text-[#0075FF]

            shadow-sm

          "

        >

          <School

            size={18}

          />

        </div>

        <div

          className="

            min-w-0

          "

        >

          <p

            className="

              font-bold

              text-[#0B3A67]

            "

          >

            {

              child.full_name

            }

          </p>

          <p

            className="

              mt-1

              text-xs

              font-medium

              text-[#0075FF]

            "

          >

            {

              child.class_name ||
              "--"

            }

          </p>

          <p

            className="

              mt-1

              text-[10px]

              text-slate-400

            "

          >

            Admission:{" "}

            {

              child.admission_no

            }

          </p>

          <p

            className="

              mt-1

              text-[10px]

              text-slate-400

            "

          >

            Relationship:{" "}

            {

              child.relationship ||

              "--"

            }

          </p>

        </div>

      </div>

    </div>

  );

}

// =========================================================

// LOADING

// =========================================================

function LoadingState() {

  return (

    <div

      className="

        flex

        min-h-[450px]

        items-center

        justify-center

      "

    >

      <div className="text-center">

        <Loader2

          size={32}

          className="

            mx-auto

            animate-spin

            text-[#0075FF]

          "

        />

        <p

          className="

            mt-3

            text-sm

            text-slate-500

          "

        >

          Loading profile...

        </p>

      </div>

    </div>

  );

}
