"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  BriefcaseBusiness,
  Home,
  Loader2,
  Mail,
  MapPin,
  Phone,
  School,
  ShieldCheck,
  UserRound,
  Users,
} from "lucide-react";

import {
  getParentProfile,
} from "@/services/parentService";


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


  // =======================================================
  // LOAD PROFILE
  // =======================================================

  useEffect(() => {
    let cancelled = false;


    async function loadProfile() {
      try {

        const data =
          await getParentProfile();


        if (cancelled) {
          return;
        }


        setProfile(
          data
        );

        setError("");

      } catch (err) {

        console.error(
          "Parent profile:",
          err
        );


        if (!cancelled) {

          setError(
            err?.response
              ?.data
              ?.detail ||
            "Unable to load profile."
          );

        }

      } finally {

        if (!cancelled) {
          setLoading(
            false
          );
        }

      }
    }


    loadProfile();


    return () => {
      cancelled = true;
    };

  }, []);


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
                <img
                  src={
                    profile.profile_image_url
                  }
                  alt={
                    profile.name
                  }
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