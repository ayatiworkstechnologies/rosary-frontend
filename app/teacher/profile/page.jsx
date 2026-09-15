"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  BookOpen,
  BriefcaseBusiness,
  CalendarDays,
  GraduationCap,
  IdCard,
  Loader2,
  Mail,
  Phone,
  School,
  ShieldCheck,
  User,
  Users,
} from "lucide-react";

import {
  getTeacherProfile,
} from "@/services/teacherService";


// =========================================================
// FORMAT DATE
// =========================================================

function formatDate(
  value
) {
  if (!value) {
    return "--";
  }

  const date =
    new Date(
      `${value}T00:00:00`
    );

  return date.toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
}


// =========================================================
// MAIN PAGE
// =========================================================

export default function TeacherProfilePage() {
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
    const loadProfile =
      async () => {

        try {

          setLoading(true);

          setError("");

          const data =
            await getTeacherProfile();

          setProfile(
            data
          );

        } catch (err) {

          console.error(
            "Teacher profile error:",
            err
          );

          setError(
            err?.response
              ?.data
              ?.detail ||
            "Unable to load teacher profile."
          );

        } finally {

          setLoading(false);

        }

      };


    loadProfile();

  }, []);


  // =======================================================
  // LOADING
  // =======================================================

  if (loading) {
    return (
      <div
        className="
          flex
          min-h-[500px]
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

          <p className="mt-3 text-sm text-slate-500">
            Loading profile...
          </p>

        </div>

      </div>
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
    "T";


  return (
    <div
      className="
        mx-auto
        max-w-[1200px]
      "
    >

      {/* =========================================
          PAGE HEADER
      ========================================== */}

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
          View your personal and
          professional information.
        </p>

      </div>


      {/* =========================================
          PROFILE HERO
      ========================================== */}

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
            relative
            h-[50px]
            
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

              {/* IMAGE / INITIALS */}

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
                  {profile.designation ||
                    "Teacher"}
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

              {profile.is_active
                ? "Active Account"
                : "Inactive Account"}

            </div>

          </div>

        </div>

      </section>


      {/* =========================================
          ACCOUNT + PROFESSIONAL
      ========================================== */}

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
          icon={User}
        >

          <ProfileField
            icon={IdCard}
            label="Teacher ID"
            value={
              profile.employee_id ||
              profile.username
            }
          />

          <ProfileField
            icon={User}
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

        </ProfileSection>


        {/* PROFESSIONAL */}

        <ProfileSection
          title="Professional Information"
          icon={
            BriefcaseBusiness
          }
        >

          <ProfileField
            icon={
              BriefcaseBusiness
            }
            label="Designation"
            value={
              profile.designation ||
              "--"
            }
          />

          <ProfileField
            icon={School}
            label="Department"
            value={
              profile.department ||
              "--"
            }
          />

          <ProfileField
            icon={
              GraduationCap
            }
            label="Qualification"
            value={
              profile.qualification ||
              "--"
            }
          />

          <ProfileField
            icon={
              BriefcaseBusiness
            }
            label="Experience"
            value={
              profile.experience_years !=
              null
                ? `${profile.experience_years} Years`
                : "--"
            }
          />

          <ProfileField
            icon={
              CalendarDays
            }
            label="Joining Date"
            value={
              formatDate(
                profile.joining_date
              )
            }
          />

        </ProfileSection>

      </div>


      {/* =========================================
          ASSIGNED CLASSES
      ========================================== */}

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

            <Users size={19} />

          </div>


          <div>

            <h2
              className="
                font-bold
                text-[#0B3A67]
              "
            >
              Assigned Classes
            </h2>

            <p
              className="
                mt-0.5
                text-xs
                text-slate-400
              "
            >
              Classes and subjects assigned
              to your account.
            </p>

          </div>

        </div>


        {profile.assigned_classes
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

            {profile.assigned_classes.map(
              (item) => (
                <AssignedClassCard
                  key={
                    item.class_id
                  }
                  item={item}
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

            <BookOpen
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
              No classes assigned.
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
        items-center
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
// ASSIGNED CLASS
// =========================================================

function AssignedClassCard({
  item,
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

          <BookOpen
            size={18}
          />

        </div>


        <div>

          <p
            className="
              font-bold
              text-[#0B3A67]
            "
          >
            {item.name}
          </p>

          <p
            className="
              mt-1
              text-xs
              font-medium
              text-[#0075FF]
            "
          >
            {item.subject ||
              "Subject not assigned"}
          </p>

          <p
            className="
              mt-1
              text-[10px]
              text-slate-400
            "
          >
            Academic Year{" "}
            {item.academic_year}
          </p>

        </div>

      </div>

    </div>
  );
}