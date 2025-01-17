"use client";
import * as React from "react";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import TextInput from "@/components/common/text-input/input";
import { Button } from "@/components/common/button/button";
import Link from "next/link";
import dynamic from "next/dynamic";
import EditorJS, { OutputData } from "@editorjs/editorjs";
import { AiFillPlusCircle } from "react-icons/ai";
import { fetchApi } from "@/components/mixins/request";
import Swal from "sweetalert2";
import DateRangePicker from "../laporan/x-modal/XDateRangePicker";
import { formatDate, getTime } from "@/components/hooks/formatDate";
import Select from "react-select";
import Loading from "@/components/global/Loading/loading";
import { AiOutlineClose } from "react-icons/ai";
import { withFormik, FormikProps, FormikBag } from "formik";
import * as Yup from "yup";
import { shallowEqual, useSelector } from "react-redux";
import { State } from "@/store/reducer";
import axios from "axios";
import { getCookies } from "cookies-next";
import { IoMdClose } from "react-icons/io";
import { formatMonth } from "@/components/helpers/formatMonth";

const EditorBlock = dynamic(() => import("../../hooks/editor"));

interface FormValues {
  tagging: any;
  rangeTanggal: any;
  jam: any;
  pendahuluan: string;
  pimpinanRapat: string;
  pesertaArray: any;
  isiRapat: any;
  tindakLanjut: any;
  lokasi: string;
  acara: string;
  pelapor: any;
  atasan: any;
  sasaran: any
  suratUndangan: any;
  daftarHadir: any;
  spj: any;
  foto: any;
  pendukung: any;
  dibuatTanggal: any;
}

interface OtherProps {
  title?: string;
  ref?: any;
  dataNotulen?: any;
  pelapor?: any;
  atasan?: any;
  sasaran?: any;
}

interface MyFormProps extends OtherProps {
  handleSubmit: (
    values: FormValues,
    formikBag: FormikBag<object, FormValues>
  ) => void;
}

const FormField = (props: OtherProps & FormikProps<FormValues>) => {
  const {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    handleSubmit,
    isSubmitting,
    ref,
  } = props;
  const { profile } = useSelector((state: State) => ({
    profile: state.profile.profile
  }), shallowEqual)

  const router = useRouter();
  const [openDateRange, setOpenDateRange] = useState<boolean>(false);
  const [openAddParticipant, setOpenAddParticipant] = useState<boolean>(false);
  const [pesertaRapat, setPesertaRapat] = useState<string>("");
  const [idPesertaRapat, setIdPesertaRapat] = useState<number>(1);
  const [dataPegawai, setDataPegawai] = useState<any>([]);
  const [dataAtasan, setDataAtasan] = useState<any>([]);
  const [dataSasaran, setDataSasaran] = useState<any>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const [uploadMsgUndangan, setUploadMsgUndangan] = useState<string>("");
  const [progressUndangan, setProgressUndangan] = useState<any>({
    started: false,
    pc: 0,
  });

  const [uploadMsgDaftarHadir, setUploadMsgDaftarHadir] = useState<string>("");
  const [progressDaftarHadir, setProgressDaftarHadir] = useState<any>({
    started: false,
    pc: 0,
  });

  const [uploadMsgSPJ, setUploadMsgSPJ] = useState<string>("");
  const [progressSPJ, setProgressSPJ] = useState<any>({
    started: false,
    pc: 0,
  });

  const [uploadMsgfoto, setUploadMsgFoto] = useState<string>("");
  const [progressfoto, setProgressFoto] = useState<any>({
    started: false,
    pc: 0,
  });

  const [uploadMsgPendukung, setUploadMsgPendukung] = useState<string>("");
  const [progressPendukung, setProgressPendukung] = useState<any>({
    started: false,
    pc: 0,
  });

  useEffect(() => {
    fetchDataPegawai();
    fetchDataAtasan();
    fetchDataSasaran();
  }, []);

  const fetchDataPegawai = async () => {
    setLoading(true);
    const response = await fetchApi({
      url: `/pegawai/getPelapor/${profile.Perangkat_Daerah.kode_opd}/all`,
      method: "get",
      type: "auth",
    });

    if (!response.success) {
      if (response.data.code == 500) {
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "Gagal memuat data pegawai",
        });
        setLoading(false);
      }
      setLoading(false);
    } else {
      const { data } = response.data;
      let temp: any = [];
      data.forEach((item: any) => {
        temp.push({
          label: item.nama,
          value: item.nip,
          data: {
            nama: item.nama,
            nip: item.nip,
            pangkat: item.pangkat,
            namaPangkat: item.nama_pangkat,
            jabatan: item.jabatan
          },
        });
      });
      setDataPegawai(temp);
      setLoading(false);
    }
  };

  const fetchDataAtasan = async () => {
    setLoading(true);
    const response = await fetchApi({
      url: `/pegawai/getPelapor/${profile.Perangkat_Daerah.kode_opd}/atasan`,
      method: "get",
      type: "auth",
    });

    if (!response.success) {
      if (response.data.code == 500) {
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "Gagal memuat data atasan",
        });
        setLoading(false);
      }
      setLoading(false);
    } else {
      const { data } = response.data;
      const filtered = data.filter((el: any) => el.role == 3);
      let temp: any = [];
      filtered.forEach((item: any) => {
        temp.push({
          label: item.nama,
          value: item.nip,
          data: {
            nama: item.nama,
            nip: item.nip,
            pangkat: item.pangkat,
            namaPangkat: item.nama_pangkat,
            jabatan: item.jabatan
          },
        });
      });
      setDataAtasan(temp);
      setLoading(false);
    }
  };

  const fetchDataSasaran = async () => {
    setLoading(true);
    const payload = {
      nip: profile.nip,
      tahun: 2023
    }

    const response = await fetchApi({
      url: '/notulen/syncSasaran',
      method: 'post',
      type: 'auth',
      body: payload
    })

    if (!response.success) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Gagal memuat data sasaran!",
      });
      setLoading(false);
    } else {
      const { data } = response.data;
      let temp: any = [];
      data.data.sasaran_asn.map((el: any) => {
        temp.push({
          label: el.sasaran,
          value: el.id_sasaran
        })
      })
      setDataSasaran(temp);
      setLoading(false);
    }
  }

  const handleOpenAddPeserta = (e: any) => {
    e.preventDefault();
    setOpenAddParticipant(!openAddParticipant);

    if (values.pesertaArray.length)
      setIdPesertaRapat(
        values.pesertaArray[values.pesertaArray.length - 1].id++
      );
    else setIdPesertaRapat(1);
  };

  const handleAddParticipant = (e: any) => {
    e.preventDefault();
    setOpenAddParticipant(false);

    if (pesertaRapat !== "") {
      let temp = values.pesertaArray;
      temp.push({ id: idPesertaRapat, nama: pesertaRapat });
      handleChange({
        target: { name: "pesertaArray", value: temp },
      });
    }
    setPesertaRapat("");
  };

  const handleDeletePesertaArray = (e: any, nama: string) => {
    e.preventDefault();
    const newArray = values.pesertaArray.filter(
      (item: any) => item.nama !== nama
    );
    handleChange({
      target: { name: "pesertaArray", value: newArray },
    });
  };

  const handleUploadSuratUndangan = async (event: any) => {
    let url = `${process.env.BASE_URL}/upload/undangan`;

    event.preventDefault();
    const fileUrl = event.target.files[0];

    setUploadMsgUndangan("Uploading ...");
    setProgressUndangan((prevState: any) => {
      return { ...prevState, started: true };
    });

    let fd = new FormData();
    fd.append("undangan", fileUrl);
    const body: any = fd;

    const response: any = await axios.post(url, body, {
      onUploadProgress: (progressEvent: any) => {
        setProgressUndangan((prevState: any) => {
          return { ...prevState, pc: progressEvent.progress * 100 };
        });
      },
      headers: {
        Authorization: `Bearer ${getCookies()?.refreshSession}`,
        "Content-Type": "multipart/form-data",
      },
    });

    if (response.data.success) {
      const { data } = response.data;

      setUploadMsgUndangan("Upload berhasil");
      handleChange({
        target: { name: "suratUndangan", value: fileUrl.name },
      });
    } else {
      setUploadMsgUndangan("Upload gagal");
    }
  };

  const handleUploadDaftarHadir = async (event: any) => {
    let url = `${process.env.BASE_URL}/notulen/uploadFile`;
    event.preventDefault();
    const fileUrl = event.target.files[0];

    setUploadMsgDaftarHadir("Uploading ...");
    setProgressDaftarHadir((prevState: any) => {
      return { ...prevState, started: true };
    });

    let fd = new FormData();
    fd.append("file", fileUrl);
    const body: any = fd;

    const response: any = await axios.post(url, body, {
      onUploadProgress: (progressEvent: any) => {
        setProgressDaftarHadir((prevState: any) => {
          return { ...prevState, pc: progressEvent.progress * 100 };
        });
      },
      headers: {
        Authorization: `Bearer ${getCookies()?.refreshSession}`,
        "Content-Type": "multipart/form-data",
      },
    });

    if (response.data.success) {
      const { data } = response.data;

      setUploadMsgDaftarHadir("Upload berhasil");
      handleChange({
        target: { name: "daftarHadir", value: fileUrl.name },
      });
    } else {
      setUploadMsgUndangan("Upload gagal");
    }
  };

  const handleUploadSPJ = async (event: any) => {
    let url = `${process.env.BASE_URL}/notulen/uploadFile`;
    event.preventDefault();
    const fileUrl = event.target.files[0];

    setUploadMsgSPJ("Uploading ...");
    setProgressSPJ((prevState: any) => {
      return { ...prevState, started: true };
    });

    let fd = new FormData();
    fd.append("file", fileUrl);
    const body: any = fd;

    const response: any = await axios.post(url, body, {
      onUploadProgress: (progressEvent: any) => {
        setProgressSPJ((prevState: any) => {
          return { ...prevState, pc: progressEvent.progress * 100 };
        });
      },
      headers: {
        Authorization: `Bearer ${getCookies()?.refreshSession}`,
        "Content-Type": "multipart/form-data",
      },
    });

    if (response.data.success) {
      const { data } = response.data;

      setUploadMsgSPJ("Upload berhasil");
      handleChange({
        target: { name: "spj", value: fileUrl.name },
      });
    } else {
      setUploadMsgUndangan("Upload gagal");
    }
  };

  const handleUploadFoto = async (event: any) => {
    let url = `${process.env.BASE_URL}/notulen/uploadFile`;
    event.preventDefault();
    const fileUrl = event.target.files[0];

    setUploadMsgFoto("Uploading ...");
    setProgressFoto((prevState: any) => {
      return { ...prevState, started: true };
    });

    let fd = new FormData();
    fd.append("file", fileUrl);
    const body: any = fd;

    const response: any = await axios.post(url, body, {
      onUploadProgress: (progressEvent: any) => {
        setProgressFoto((prevState: any) => {
          return { ...prevState, pc: progressEvent.progress * 100 };
        });
      },
      headers: {
        Authorization: `Bearer ${getCookies()?.refreshSession}`,
        "Content-Type": "multipart/form-data",
      },
    });

    if (response.data.success) {
      const { data } = response.data;

      setUploadMsgFoto("Upload berhasil");
      handleChange({
        target: { name: "foto", value: fileUrl.name },
      });
    } else {
      setUploadMsgUndangan("Upload gagal");
    }
  };

  const handleUploadFilePendukung = async (event: any) => {
    let url = `${process.env.BASE_URL}/notulen/uploadFile`;
    event.preventDefault();
    const fileUrl = event.target.files[0];

    setUploadMsgPendukung("Uploading ...");
    setProgressPendukung((prevState: any) => {
      return { ...prevState, started: true };
    });

    let fd = new FormData();
    fd.append("file", fileUrl);
    const body: any = fd;

    const response: any = await axios.post(url, body, {
      onUploadProgress: (progressEvent: any) => {
        setProgressPendukung((prevState: any) => {
          return { ...prevState, pc: progressEvent.progress * 100 };
        });
      },
      headers: {
        Authorization: `Bearer ${getCookies()?.refreshSession}`,
        "Content-Type": "multipart/form-data",
      },
    });

    if (response.data.success) {
      const { data } = response.data;

      setUploadMsgPendukung("Upload berhasil");
      handleChange({
        target: { name: "pendukung", value: fileUrl.name },
      });
    } else {
      setUploadMsgUndangan("Upload gagal");
    }
  };

  const handleDeleteFile = async (key: string) => {
    await fetchApi({
      method: "delete",
      url: `/notulen//deleteFile/${key}`,
      type: "auth",
    });
  };

  const handleCancel = () => router.push('/notulen/laporan');

  return (
    <React.Fragment>
      {loading ? (
        <Loading loading={loading} setLoading={setLoading} />
      ) : (
        <div className="form-container relative bg-white rounded-lg">
          <form className="form-wrapper-general">
            <div className="px-8 flex flex-col space-y-7 mt-4">
              <div className="data flex flex-row mt-4">
                <div
                  className={`flex border-2 ${errors.rangeTanggal ? "border-xl-pink" : "border-light-gray"
                    } rounded-lg w-full py-3 px-4`}
                  onClick={() => setOpenDateRange(true)}
                >
                  {values?.rangeTanggal[0]?.startDate === null ? (
                    <span>Pilih Hari / Tanggal</span>
                  ) : (
                    <div className="flex gap-4">
                      {values?.rangeTanggal[0]?.startDate !== null && (
                        <span>
                          {formatDate(values?.rangeTanggal[0]?.startDate)}
                        </span>
                      )}
                      {values?.rangeTanggal[0]?.endDate !== null &&
                        values?.rangeTanggal[0]?.endDate !==
                        values?.rangeTanggal[0]?.startDate && (
                          <span>
                            {" "}
                            - {formatDate(values.rangeTanggal[0]?.endDate)}
                          </span>
                        )}
                    </div>
                  )}
                </div>
              </div>
              <div className="data items-center flex md:flex-row flex-col md:gap-4 w-full">
                <div className="md:mt-0 md:w-[25%] w-full">
                  <div className="flex border-2 border-light-gray rounded-lg w-full py-3 px-4">
                    {getTime(values.jam)}
                  </div>
                </div>
                <div className="w-[15%] text-right">Edit Waktu : </div>
                <div className="w-[60%] mb-2">
                  <TextInput
                    type="time"
                    id="jam"
                    name="jam"
                    touched={touched.rangeTanggal}
                    label="Masukkan Jam"
                    change={(e: any) => {
                      handleChange({
                        target: { name: "jam", value: e.$d },
                      });
                    }}
                    // value={values.jam}
                    errors={errors.jam}
                  />
                </div>
              </div>
              <div className="data flex flex-row">
                <TextInput
                  type="text"
                  id="acara"
                  name="acara"
                  touched={touched.acara}
                  label="Acara"
                  change={handleChange}
                  value={values.acara}
                  handleBlur={handleBlur}
                  errors={errors.acara}
                />
              </div>
              <div className="mt-2 -pb-2">Penjelasan :</div>
              <div className="data flex flex-row">
                <TextInput
                  type="text-area"
                  id="pendahuluan"
                  name="pendahuluan"
                  touched={touched.pendahuluan}
                  label="Pendahuluan"
                  change={handleChange}
                  value={values.pendahuluan}
                  handleBlur={handleBlur}
                  errors={errors.pendahuluan}
                />
              </div>
              <div className="data flex flex-row">
                <TextInput
                  type="text"
                  id="pimpinanRapat"
                  name="pimpinanRapat"
                  touched={touched.pimpinanRapat}
                  label="Pimpinan Rapat"
                  change={handleChange}
                  value={values?.pimpinanRapat}
                  handleBlur={handleBlur}
                  errors={errors.pimpinanRapat}
                />
              </div>
              <div className="flex flex-col justify-center mb-2">
                <div className="flex gap-2">
                  <button onClick={(e) => handleOpenAddPeserta(e)}>
                    <AiFillPlusCircle size={26} />
                  </button>
                  <div>Tambah Peserta</div>
                </div>
                <div>
                  <div className="flex flex-col w-full mt-8">
                    <TextInput
                      type="text"
                      id="pesertaRapat"
                      name="pesertaRapat"
                      label="Peserta Rapat"
                      change={(e: any) => setPesertaRapat(e.target.value)}
                      value={pesertaRapat}
                      handleBlur={handleBlur}
                    />
                    <div className="flex justify-center items-center md:gap-8 md:mx-10 mt-3">
                      <button
                        className="text-xl-pink"
                        onClick={(e) => handleAddParticipant(e)}
                      >
                        Batal
                      </button>
                      <button
                        className="text-xl-base"
                        onClick={(e) => handleAddParticipant(e)}
                      >
                        Tambah
                      </button>
                    </div>
                  </div>
                </div>
                <ul className="mt-4 ml-4">
                  {values.pesertaArray.map((el: any, i: number) => (
                    <li className="font flex flex-col gap-2" key={i}>
                      <div className="flex justify-between">
                        <div className="flex gap-2">
                          <div
                            className={`${values.pesertaArray.length > 1 ? "block" : "hidden"
                              }`}
                          >
                            {i + 1} .
                          </div>
                          <div>{el.nama}</div>
                        </div>
                        <div>
                          <button
                            onClick={(e: any) =>
                              handleDeletePesertaArray(e, el.nama)
                            }
                          >
                            <AiOutlineClose size={18} />
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <div className="text-deep-gray">Tambahkan Isi Rapat</div>
                <div className="container border border-light-gray rounded-lg">
                  <EditorBlock
                    data={values.isiRapat}
                    onChange={(e) => {
                      handleChange({
                        target: { name: "isiRapat", value: e },
                      });
                    }}
                    holder="editorjs-container"
                  />
                </div>
              </div>
              <div>
                <div className="text-deep-gray">Tindak Lanjut</div>
                <div className="container border border-light-gray rounded-lg">
                  <EditorBlock
                    data={values.tindakLanjut}
                    onChange={(e) => {
                      handleChange({
                        target: { name: "tindakLanjut", value: e },
                      });
                    }}
                    holder="editorjs-container2"
                  />
                </div>
              </div>
              <div className="data flex flex-row">
                <TextInput
                  type="text"
                  id="lokasi"
                  name="lokasi"
                  label="Lokasi / tempat"
                  touched={touched.lokasi}
                  change={handleChange}
                  value={values.lokasi}
                  errors={errors.lokasi}
                  handleBlur={handleBlur}
                />
              </div>
              <div className="data flex flex-row">
                <TextInput
                  type="dropdown"
                  id="pelapor"
                  name="pelapor"
                  label="Nama Pelapor"
                  touched={touched.pelapor}
                  errors={errors.pelapor}
                  value={values.pelapor}
                  placeholder="Ketik dan pilih pelapor"
                  options={dataPegawai}
                  handleBlur={handleBlur}
                  setValueSelected={handleChange}
                  change={(selectedOption: any) => {
                    handleChange({
                      target: { name: "pelapor", value: selectedOption },
                    });
                  }}
                />
              </div>
              <div className="data flex flex-row">
                <TextInput
                  type="dropdown"
                  id="atasan"
                  name="atasan"
                  label="Nama Atasan"
                  touched={touched.atasan}
                  errors={errors.atasan}
                  value={values.atasan}
                  placeholder="Ketik dan pilih atasan"
                  options={dataAtasan}
                  handleBlur={handleBlur}
                  setValueSelected={handleChange}
                  change={(selectedOption: any) => {
                    handleChange({
                      target: { name: "atasan", value: selectedOption },
                    });
                  }}
                />
              </div>
              <div className="data flex flex-row w-full mt-2">
                <div className="flex flex-col gap-3">
                  <div>Masukkan tanggal pembuatan notulen :</div>
                  <TextInput
                    type="date-picker"
                    id="dibuatTanggal"
                    name="dibuatTanggal"
                    touched={touched.dibuatTanggal}
                    change={(e: any) => {
                      handleChange({
                        target: { name: "dibuatTanggal", value: e.$d },
                      });
                    }}
                    value={values.dibuatTanggal}
                    errors={errors.dibuatTanggal}
                  />
                </div>
              </div>
              <div className="data flex flex-row">
                <TextInput
                  type="dropdown"
                  id="sasaran"
                  name="sasaran"
                  label="Nama sasaran"
                  touched={touched.sasaran}
                  errors={errors.sasaran}
                  placeholder="Ketik dan pilih Sasaran"
                  options={dataSasaran}
                  handleBlur={handleBlur}
                  setValueSelected={handleChange}
                  change={(selectedOption: any) => {
                    handleChange({
                      target: { name: "sasaran", value: selectedOption },
                    });
                  }}
                />
              </div>
              {values.suratUndangan == null ? (
                <div className="data flex flex-col">
                  <label className="block mb-2 text-sm font-medium text-gray-900 text-Nunito dark:text-white">
                    Upload Surat Undangan
                  </label>
                  <input
                    className="block w-full text-md text-gray-900 border border-light-gray py-2 rounded-lg cursor-pointer bg-white focus:outline-none"
                    type="file"
                    onChange={(event: any) => {
                      handleUploadSuratUndangan(event);
                    }}
                  />
                  <div className="w-full">
                    {progressUndangan.started && (
                      <progress max="100" value={progressUndangan.pc}></progress>
                    )}
                  </div>
                  {uploadMsgUndangan && <span>{uploadMsgUndangan}</span>}
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex flex-col gap-2">
                    <div>Surat Undangan</div>
                    <Link
                      href={`${process.env.BASEURL}/notulen/getFile/${values.suratUndangan}`}
                      passHref
                      legacyBehavior
                    >
                      <a target="_blank">
                        <td className="text-blue-500 underline">
                          {values.suratUndangan}
                        </td>
                      </a>
                    </Link>
                  </div>
                  <div onClick={() => handleDeleteFile(values.suratUndangan)}>
                    <IoMdClose size={20} />
                  </div>
                </div>
              )}
              {values.daftarHadir == null ? (
                <div className="data flex flex-col">
                  <label className="block mb-2 text-sm font-medium text-gray-900 text-Nunito dark:text-white">
                    Upload Daftar Hadir
                  </label>
                  <input
                    className="block w-full text-md text-gray-900 border border-light-gray py-2 rounded-lg cursor-pointer bg-white focus:outline-none"
                    type="file"
                    onChange={(event: any) => {
                      handleUploadDaftarHadir(event);
                    }}
                  />
                  <div className="w-full">
                    {progressDaftarHadir.started && (
                      <progress
                        max="100"
                        value={progressDaftarHadir.pc}
                      ></progress>
                    )}
                  </div>
                  {uploadMsgDaftarHadir && <span>{uploadMsgDaftarHadir}</span>}
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex flex-col gap-2">
                    <div>Daftar Hadir</div>
                    <Link
                      href={`${process.env.BASEURL}/notulen/getFile/${values.daftarHadir}`}
                      passHref
                      legacyBehavior
                    >
                      <a target="_blank">
                        <td className="text-blue-500 underline">
                          {values.daftarHadir}
                        </td>
                      </a>
                    </Link>
                  </div>
                  <div onClick={() => handleDeleteFile(values.daftarHadir)}>
                    <IoMdClose size={20} />
                  </div>
                </div>
              )}
              {values.spj == null ? (
                <div className="data flex flex-col">
                  <label className="block mb-2 text-sm font-medium text-gray-900 text-Nunito dark:text-white">
                    Upload SPJ
                  </label>
                  <input
                    className="block w-full text-md text-gray-900 border border-light-gray py-2 rounded-lg cursor-pointer bg-white focus:outline-none"
                    type="file"
                    onChange={(event: any) => {
                      handleUploadSPJ(event);
                    }}
                  />
                  <div className="w-full">
                    {progressSPJ.started && (
                      <progress max="100" value={progressSPJ.pc}></progress>
                    )}
                  </div>
                  {uploadMsgSPJ && <span>{uploadMsgSPJ}</span>}
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex flex-col gap-2">
                    <div>SPJ</div>
                    <Link
                      href={`${process.env.BASEURL}/notulen/getFile/${values.spj}`}
                      passHref
                      legacyBehavior
                    >
                      <a target="_blank">
                        <td className="text-blue-500 underline">{values.spj}</td>
                      </a>
                    </Link>
                  </div>
                  <div onClick={() => handleDeleteFile(values.spj)}>
                    <IoMdClose size={20} />
                  </div>
                </div>
              )}
              {values.foto == null ? (
                <div className="data flex flex-col">
                  <label className="block mb-2 text-sm font-medium text-gray-900 text-Nunito dark:text-white">
                    Upload Foto
                  </label>
                  <input
                    className="block w-full text-md text-gray-900 border border-light-gray py-2 rounded-lg cursor-pointer bg-white focus:outline-none"
                    type="file"
                    onChange={(event: any) => {
                      handleUploadFoto(event);
                    }}
                  />
                  <div className="w-full">
                    {progressfoto.started && (
                      <progress max="100" value={progressfoto.pc}></progress>
                    )}
                  </div>
                  {uploadMsgfoto && <span>{uploadMsgfoto}</span>}
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex flex-col gap-2">
                    <div>Foto</div>
                    <Link
                      href={`${process.env.BASEURL}/notulen/getFile/${values.foto}`}
                      passHref
                      legacyBehavior
                    >
                      <a target="_blank">
                        <td className="text-blue-500 underline">{values.foto}</td>
                      </a>
                    </Link>
                  </div>
                  <div onClick={() => handleDeleteFile(values.foto)}>
                    <IoMdClose size={20} />
                  </div>
                </div>
              )}
              {values.pendukung == null ? (
                <div className="data flex flex-col">
                  <label className="block mb-2 text-sm font-medium text-gray-900 text-Nunito dark:text-white">
                    Upload Pendukung
                  </label>
                  <input
                    className="block w-full text-md text-gray-900 border border-light-gray py-2 rounded-lg cursor-pointer bg-white focus:outline-none"
                    type="file"
                    onChange={(event: any) => {
                      handleUploadFilePendukung(event);
                    }}
                  />
                  <div className="w-full">
                    {progressPendukung.started && (
                      <progress max="100" value={progressPendukung.pc}></progress>
                    )}
                  </div>
                  {uploadMsgPendukung && <span>{uploadMsgPendukung}</span>}
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex flex-col gap-2">
                    <div>File Pendukung</div>
                    <Link
                      href={`${process.env.BASEURL}/notulen/getFile/${values.pendukung}`}
                      passHref
                      legacyBehavior
                    >
                      <a target="_blank">
                        <td className="text-blue-500 underline">
                          {values.pendukung}
                        </td>
                      </a>
                    </Link>
                  </div>
                  <div onClick={() => handleDeleteFile(values.pendukung)}>
                    <IoMdClose size={20} />
                  </div>
                </div>
              )}
            </div>
            <div className="btn-submit mx-8 flex flex-row justify-between pb-4 mt-4 space-x-3">
              <div className="w-[8em] absolute bottom-6 right-8">
                <Button
                  variant="xl"
                  className="button-container"
                  loading={loading}
                  rounded
                  onClick={handleSubmit}
                >
                  <div className="flex justify-center items-center text-white font-Nunito">
                    <span className="button-text">Tambah</span>
                  </div>
                </Button>
              </div>
            </div>
          </form>
          <div className="w-[8em] pb-6 pt-2 pl-6">
            <Button
              variant="xl"
              type="secondary"
              className="button-container"
              rounded
            >
              <div className="flex justify-center items-center text-[#002DBB] font-Nunito" onClick={handleCancel}>
                <span className="button-text">Batal</span>
              </div>
            </Button>
          </div>

          <DateRangePicker
            isOpen={openDateRange}
            setIsOpen={setOpenDateRange}
            rangeTanggal={values.rangeTanggal}
            setRangeTanggal={(e: any) => {
              handleChange({
                target: { name: "rangeTanggal", value: [e.selection] },
              });
            }}
          />
        </div>
      )}
    </React.Fragment>
  );
};

function CreateForm({ handleSubmit, dataNotulen, pelapor, atasan, sasaran }: MyFormProps) {
  const FormWithFormik = withFormik({
    mapPropsToValues: () => ({
      tagging: [],
      rangeTanggal: [
        {
          startDate: dataNotulen.tanggal[0]?.startDate != null ? new Date(dataNotulen.tanggal[0]?.startDate) : null,
          endDate: dataNotulen.tanggal[0]?.endDate != null ? new Date(dataNotulen.tanggal[0]?.endDate) : null,
          key: "selection",
        },
      ],
      jam: dataNotulen.waktu !== null ? dataNotulen.waktu : null,
      pendahuluan: dataNotulen.pendahuluan !== null ? dataNotulen.pendahuluan : "",
      pimpinanRapat: dataNotulen.pimpinan_rapat !== null ? dataNotulen.pimpinan_rapat : "",
      pesertaArray: dataNotulen.peserta_rapat.length != 0 ? dataNotulen.peserta_rapat : [],
      isiRapat: dataNotulen.isi_rapat !== null ? JSON.parse(dataNotulen.isi_rapat) : null,
      tindakLanjut: dataNotulen.tindak_lanjut !== null ? JSON.parse(dataNotulen.tindak_lanjut) : null,
      lokasi: dataNotulen.lokasi !== "" ? dataNotulen.lokasi : "",
      acara: dataNotulen.acara !== "" ? dataNotulen.acara : "",
      pelapor: dataNotulen.pelapor !== null ? pelapor : null,
      atasan: dataNotulen.atasan !== null ? atasan : null,
      sasaran: dataNotulen.sasaran !== null ? sasaran : null,
      suratUndangan: dataNotulen.link_img_surat_undangan !== null ? dataNotulen.link_img_surat_undangan : null,
      daftarHadir: dataNotulen.link_img_daftar_hadir !== null ? dataNotulen.link_img_daftar_hadir : null,
      spj: dataNotulen.link_img_spj !== null ? dataNotulen.link_img_spj : null,
      foto: dataNotulen.link_img_foto !== null ? dataNotulen.link_img_foto : null,
      pendukung: dataNotulen.link_img_pendukung !== null ? dataNotulen.link_img_pendukung : null,
      dibuatTanggal: null
    }),
    validationSchema: Yup.object().shape({
      rangeTanggal: Yup.array()
        .required("Harap isi tanggal pelaksanaan !"),
      jam: Yup.mixed()
        .nullable()
        .required("Waktu tidak boleh kosong !"),
      pendahuluan: Yup.string()
        .required("Harap isi pendahuluan !")
        .min(4, "Minimal 4 karakter"),
      pimpinanRapat: Yup.string()
        .required("Harap isi nama pimpinan rapat !"),
      pesertaArray: Yup.array()
        .required("Harap isi peserta !"),
      isiRapat: Yup.mixed()
        .nullable(),
      tindakLanjut: Yup.mixed()
        .nullable(),
      lokasi: Yup.string()
        .required("Lokasi tidak boleh kosong !"),
      acara: Yup.string()
        .required("Acara tidak boleh kosong !"),
      pelapor: Yup.object()
        .shape({
          label: Yup.string(),
          value: Yup.number(),
        })
        .required("Bagian dibutuhkan")
        .nullable(),
      atasan: Yup.object()
        .shape({
          label: Yup.string(),
          value: Yup.number(),
        })
        .required("Bagian dibutuhkan")
        .nullable(),
      sasaran: Yup.object()
        .shape({
          label: Yup.string(),
          value: Yup.number(),
        })
        .required("Bagian dibutuhkan")
        .nullable(),
      dibuatTanggal: Yup.mixed().nullable().required("Tanggal tidak boleh kosong !"),
    }),
    handleSubmit,
  })(FormField);

  return <FormWithFormik />;
}

interface PropTypes {
  dataNotulen: any;
}

const AddNotulenForm = ({ dataNotulen }: PropTypes) => {
  const [pelapor, setNamaPelapor] = useState<any>(null);
  const [atasan, setAtasan] = useState<any>(null);
  const [sasaran, setSasaran] = useState<any>(null);

  const { profile } = useSelector(
    (state: State) => ({
      profile: state.profile.profile,
    }),
    shallowEqual
  );

  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();

  useEffect(() => {
    setNamaPelapor({
      label: dataNotulen.pelapor.nama,
      value: dataNotulen.pelapor.nip,
      data: {
        nama: dataNotulen.pelapor.nama,
        nip: dataNotulen.pelapor.nip,
        pangkat: dataNotulen.pelapor.pangkat,
        namaPangkat: dataNotulen.pelapor.nama_pangkat,
        jabatan: dataNotulen.pelapor.jabatan
      },
    });

    setAtasan({
      label: dataNotulen.atasan.nama,
      value: dataNotulen.atasan.nip,
      data: {
        nama: dataNotulen.atasan.nama,
        nip: dataNotulen.atasan.nip,
        pangkat: dataNotulen.atasan.pangkat,
        namaPangkat: dataNotulen.atasan.nama_pangkat,
        jabatan: dataNotulen.atasan.jabatan
      },
    })
  }, [])

  const handleSubmit = async (values: FormValues) => {
    const payload = {
      tanggal: values.rangeTanggal,
      waktu: values.jam,
      pendahuluan: values.pendahuluan,
      pimpinan_rapat: values.pimpinanRapat,
      peserta_rapat: values.pesertaArray,
      isi_rapat: JSON.stringify(values.isiRapat),
      tindak_lanjut: JSON.stringify(values.tindakLanjut),
      lokasi: values.lokasi,
      acara: values.acara,
      pelapor: values.pelapor.data,
      atasan: values.atasan.data,
      sasaran: values.sasaran.value,
      status: "-",
      hari: new Date(values.dibuatTanggal).getDate(),
      bulan: new Date(values.dibuatTanggal).getMonth() + 1,
      tahun: new Date(values.dibuatTanggal).getFullYear(),
      link_img_surat_undangan: values.suratUndangan,
      link_img_daftar_hadir: values.daftarHadir,
      link_img_spj: values.spj,
      link_img_foto: values.foto,
      link_img_pendukung: values.pendukung,
      kode_opd: profile.Perangkat_Daerah.kode_opd,
      nip_pegawai: profile.nip,
      nip_atasan: values.atasan.value
    };

    const response = await fetchApi({
      url: `/notulen/addNotulen`,
      method: "post",
      body: payload,
      type: "auth",
    });

    if (!response.success) {
      if (response.data.code == 500) {
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "Koneksi bermasalah!",
        });
      }
      setLoading(false);
    } else {
      Swal.fire({
        position: "top-end",
        icon: "success",
        title: "Your work has been saved",
        showConfirmButton: false,
        timer: 1500,
      });
      router.push("/notulen/laporan");
      setLoading(false);
    }
  };

  return (
    <div>
      {loading ? (
        <Loading loading={loading} setLoading={setLoading} />
      ) : (
        <CreateForm
          handleSubmit={handleSubmit}
          dataNotulen={dataNotulen}
          pelapor={pelapor}
          atasan={atasan}
          sasaran={sasaran}
        />
      )}
    </div>
  );
};

export default AddNotulenForm;