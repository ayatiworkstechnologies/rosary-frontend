"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import { useRouter } from "next/navigation";

import {
  Bell,
  ChevronDown,
  Menu,
  CheckCheck,
  Loader2,
} from "lucide-react";

import useStoredUser from "@/hooks/useStoredUser";

import {
  getNotifications,
  getUnreadNotificationCount,
  markNotificationAsRead,
} from "@/services/notificationService";


export default function PortalHeader({
  portalName,
  onMenuClick,
}) {
  const router = useRouter();

  const user = useStoredUser();

  const isParentPortal =
    portalName === "Parent Portal";


  // =====================================================
  // NOTIFICATION STATE
  // =====================================================

  const [
    unreadCount,
    setUnreadCount,
  ] = useState(0);

  const [
    notifications,
    setNotifications,
  ] = useState([]);

  const [
    isOpen,
    setIsOpen,
  ] = useState(false);

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const [
    processingId,
    setProcessingId,
  ] = useState(null);


  const dropdownRef = useRef(null);


  // =====================================================
  // FETCH UNREAD COUNT
  // PARENT PORTAL ONLY
  // =====================================================

  useEffect(() => {
    if (!isParentPortal) {
      return;
    }

    let active = true;


    async function loadCount() {
      try {
        const data =
          await getUnreadNotificationCount();

        if (active) {
          setUnreadCount(
            data?.unread_count ?? 0
          );
        }
      } catch (err) {
        console.error(
          "Unable to load notification count:",
          err
        );
      }
    }


    loadCount();


    return () => {
      active = false;
    };
  }, [isParentPortal]);


  // =====================================================
  // CLOSE DROPDOWN WHEN CLICKING OUTSIDE
  // =====================================================

  useEffect(() => {
    if (!isOpen) {
      return;
    }


    function handleOutsideClick(event) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(
          event.target
        )
      ) {
        setIsOpen(false);
      }
    }


    function handleEscape(event) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }


    document.addEventListener(
      "mousedown",
      handleOutsideClick
    );

    document.addEventListener(
      "keydown",
      handleEscape
    );


    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );

      document.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, [isOpen]);


  // =====================================================
  // OPEN NOTIFICATION DROPDOWN
  // PARENT PORTAL ONLY
  // =====================================================

  async function handleBellClick() {
    if (!isParentPortal) {
      return;
    }


    if (isOpen) {
      setIsOpen(false);
      return;
    }


    setIsOpen(true);

    setLoading(true);

    setError("");


    try {
      const [
        items,
        countData,
      ] = await Promise.all([
        getNotifications(),
        getUnreadNotificationCount(),
      ]);


      setNotifications(
        Array.isArray(items)
          ? items
          : []
      );


      setUnreadCount(
        countData?.unread_count ?? 0
      );
    } catch (err) {
      console.error(
        "Unable to load notifications:",
        err
      );

      setError(
        "Unable to load notifications. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }


  // =====================================================
  // MARK NOTIFICATION AS READ
  // =====================================================

  async function handleNotificationClick(
    notification
  ) {
    if (processingId !== null) {
      return;
    }


    setProcessingId(
      notification.id
    );

    setError("");


    try {
      if (!notification.is_read) {
        await markNotificationAsRead(
          notification.id
        );


        setNotifications(
          (previous) =>
            previous.map(
              (item) =>
                item.id ===
                notification.id
                  ? {
                      ...item,
                      is_read: true,
                    }
                  : item
            )
        );


        const countData =
          await getUnreadNotificationCount();


        setUnreadCount(
          countData?.unread_count ?? 0
        );
      }


      setIsOpen(false);


      // Only navigate to internal Parent Portal pages.

      if (
        typeof notification.link ===
          "string" &&
        notification.link.startsWith(
          "/parent/"
        ) &&
        !notification.link.startsWith(
          "//"
        )
      ) {
        router.push(
          notification.link
        );
      }
    } catch (err) {
      console.error(
        "Unable to mark notification as read:",
        err
      );

      setError(
        "Unable to update notification. Please try again."
      );
    } finally {
      setProcessingId(null);
    }
  }


  // =====================================================
  // USER INITIALS
  // =====================================================

  const initials =
    user?.name
      ?.split(" ")
      .filter(Boolean)
      .map((item) => item[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "U";


  // =====================================================
  // FORMAT NOTIFICATION DATE
  // =====================================================

  function formatDate(dateValue) {
    if (!dateValue) {
      return "";
    }


    const date =
      new Date(dateValue);


    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return "";
    }


    return date.toLocaleString(
      "en-IN",
      {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      }
    );
  }


  // =====================================================
  // HEADER
  // =====================================================

  return (
    <header
      className="
        sticky
        top-0
        z-30
        flex
        h-[66px]
        items-center
        justify-between
        border-b
        border-[#E4EDF7]
        bg-white
        px-4
        md:px-6
        lg:justify-end
        lg:px-8
      "
    >

      {/* =========================================
          MOBILE LEFT
      ========================================== */}

      <div className="flex items-center gap-3 lg:hidden">

        <button
          type="button"
          onClick={onMenuClick}
          className="text-[#0075FF]"
          aria-label="Open navigation menu"
        >
          <Menu size={24} />
        </button>


        <h1 className="font-semibold text-[#0B3A67]">
          {portalName}
        </h1>

      </div>


      {/* =========================================
          RIGHT SIDE
      ========================================== */}

      <div className="flex items-center gap-4">

        {/* =========================================
            NOTIFICATION AREA
        ========================================== */}

        <div
          className="relative"
          ref={dropdownRef}
        >

          <button
            type="button"
            onClick={handleBellClick}
            className="relative text-[#0B3A67]"
            aria-label={
              isParentPortal
                ? `Notifications: ${unreadCount} unread`
                : "Notifications"
            }
            aria-expanded={
              isParentPortal
                ? isOpen
                : undefined
            }
            aria-haspopup={
              isParentPortal
                ? "true"
                : undefined
            }
          >

            <Bell size={21} />


            {/* REAL BADGE ONLY FOR PARENT PORTAL */}

            {isParentPortal &&
              unreadCount > 0 && (

                <span
                  className="
                    absolute
                    -right-1
                    -top-1
                    flex
                    h-4
                    min-w-4
                    items-center
                    justify-center
                    rounded-full
                    bg-red-500
                    px-1
                    text-[9px]
                    text-white
                  "
                >
                  {unreadCount > 99
                    ? "99+"
                    : unreadCount}
                </span>

              )}

          </button>


          {/* =========================================
              PARENT NOTIFICATION DROPDOWN
          ========================================== */}

          {isParentPortal &&
            isOpen && (

              <div
                className="
                  absolute
                  right-0
                  top-10
                  z-50
                  w-[calc(100vw-2rem)]
                  max-w-[380px]
                  overflow-hidden
                  rounded-xl
                  border
                  border-[#E4EDF7]
                  bg-white
                  shadow-xl
                  sm:w-[380px]
                "
              >

                {/* DROPDOWN HEADER */}

                <div
                  className="
                    flex
                    items-center
                    justify-between
                    border-b
                    border-[#E4EDF7]
                    px-4
                    py-3
                  "
                >

                  <div>

                    <h2 className="font-semibold text-[#0B3A67]">
                      Notifications
                    </h2>


                    <p className="text-xs text-gray-500">
                      {unreadCount} unread
                    </p>

                  </div>


                  <Bell
                    size={18}
                    className="text-[#0075FF]"
                  />

                </div>


                {/* =========================================
                    LOADING
                ========================================== */}

                {loading ? (

                  <div
                    className="
                      flex
                      items-center
                      justify-center
                      gap-2
                      py-10
                      text-sm
                      text-gray-500
                    "
                  >

                    <Loader2
                      size={18}
                      className="animate-spin"
                    />

                    Loading notifications...

                  </div>

                ) : (

                  <>

                    {/* =========================================
                        ERROR
                    ========================================== */}

                    {error && (

                      <div
                        role="alert"
                        className="
                          border-b
                          border-red-100
                          bg-red-50
                          px-4
                          py-3
                          text-xs
                          text-red-600
                        "
                      >
                        {error}
                      </div>

                    )}


                    {/* =========================================
                        EMPTY STATE
                    ========================================== */}

                    {notifications.length ===
                      0 &&
                    !error ? (

                      <div className="px-4 py-10 text-center">

                        <CheckCheck
                          size={30}
                          className="
                            mx-auto
                            mb-3
                            text-gray-400
                          "
                        />


                        <p className="text-sm font-medium text-[#0B3A67]">
                          No notifications yet
                        </p>


                        <p className="mt-1 text-xs text-gray-500">
                          New homework alerts will appear here.
                        </p>

                      </div>

                    ) : (

                      <div className="max-h-[360px] overflow-y-auto">

                        {notifications.map(
                          (notification) => (

                            <button
                              key={
                                notification.id
                              }
                              type="button"
                              onClick={() =>
                                handleNotificationClick(
                                  notification
                                )
                              }
                              disabled={
                                processingId !==
                                null
                              }
                              className={`
                                w-full
                                border-b
                                border-gray-100
                                px-4
                                py-3
                                text-left
                                transition-colors
                                hover:bg-[#F1F7FF]
                                disabled:cursor-wait

                                ${
                                  notification.is_read
                                    ? "bg-white"
                                    : "bg-[#F0F7FF]"
                                }
                              `}
                            >

                              <div className="flex items-start gap-3">

                                {/* UNREAD DOT */}

                                <div className="pt-2">

                                  <span
                                    className={`
                                      block
                                      h-2
                                      w-2
                                      rounded-full

                                      ${
                                        notification.is_read
                                          ? "bg-transparent"
                                          : "bg-[#0075FF]"
                                      }
                                    `}
                                  />

                                </div>


                                {/* NOTIFICATION CONTENT */}

                                <div className="min-w-0 flex-1">

                                  <p className="text-sm font-semibold text-[#0B3A67]">
                                    {
                                      notification.title
                                    }
                                  </p>


                                  <p className="mt-1 text-xs leading-5 text-gray-600">
                                    {
                                      notification.message
                                    }
                                  </p>


                                  <p className="mt-2 text-[11px] text-gray-400">
                                    {formatDate(
                                      notification.created_at
                                    )}
                                  </p>

                                </div>


                                {processingId ===
                                  notification.id && (

                                  <Loader2
                                    size={15}
                                    className="
                                      animate-spin
                                      text-[#0075FF]
                                    "
                                  />

                                )}

                              </div>

                            </button>

                          )
                        )}

                      </div>

                    )}

                  </>

                )}

              </div>

            )}

        </div>


        {/* =========================================
            USER PROFILE
        ========================================== */}

        <div className="flex items-center gap-2">

          <div
            className="
              flex
              h-9
              w-9
              items-center
              justify-center
              rounded-full
              bg-[#0075FF]
              text-xs
              font-bold
              text-white
            "
          >
            {initials}
          </div>


          <span className="hidden text-sm font-semibold text-[#0B3A67] sm:block">
            {user?.name || "User"}
          </span>


          <ChevronDown
            size={14}
            className="
              hidden
              text-[#0B3A67]
              sm:block
            "
          />

        </div>

      </div>

    </header>
  );
}