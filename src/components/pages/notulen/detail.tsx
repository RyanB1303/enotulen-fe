import { useRouter, usePathname } from "next/navigation";
import { formatDate } from "@/components/hooks/formatDate";
import { getTime } from "@/components/hooks/formatDate";
import { OutputData } from "@editorjs/editorjs";
import { BsPrinter } from "react-icons/bs";
import { Button } from "@/components/common/button/button";
import Select from "react-select";
import Link from "next/link";
import { fetchApi } from "@/components/mixins/request";
import { shallowEqual, useSelector } from "react-redux";
import { State } from "@/store/reducer";
import { useState } from "react";
import Swal from "sweetalert2";
import EditNotulenForm from "./edit";
import XConfirmStatus from "../laporan/x-modal/XConfirmStatus";

const editorJsHtml = require("editorjs-html");
const EditorJsToHtml = editorJsHtml();

type Props = {
  data: OutputData;
};
type ParsedContent = string | JSX.Element;

interface DetailProps {
  data: any;
  listTagging: any;
}

const NotulenDetailProps = ({ data, listTagging }: DetailProps) => {
  const pathname = usePathname();
  const router = useRouter();
  const htmlIsiRapat = EditorJsToHtml.parse(JSON.parse(data?.isi_rapat)) as ParsedContent[];
  const htmlTindakLanjut = EditorJsToHtml.parse(JSON.parse(data?.tindak_lanjut)) as ParsedContent[];

  const [isOpenEdit, setIsOpenEdit] = useState<boolean>(false);
  const [tagging, setTagging] = useState<any>([]);
  const [status, setStatus] = useState<string>('');
  const [openConfirmSubmit, setOpenConfirmSubmit] = useState<boolean>(false);

  const { profile } = useSelector(
    (state: State) => ({
      profile: state.profile.profile,
    }),
    shallowEqual
  );

  const handlePrint = () => router.push(`${pathname}/cetak`);

  const downloadFile = async (key: string) => {
    await fetchApi({
      url: `/notulen/getFile/${key}`,
      method: "get",
      type: "auth",
    });
  };

  const handleChange = (data: any) => {
    setTagging(data.target.value);
  };

  const handleSubmit = async () => {
    const payload = {
      tagging: tagging,
    };

    const response = await fetchApi({
      url: `/notulen/addTagging/${data.id}`,
      method: "put",
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
    } else {
      Swal.fire({
        position: "center",
        icon: "success",
        title: "Tagging berhasil ditambahkan",
        showConfirmButton: false,
        timer: 1500,
      });
      router.push("/notulen/laporan");
    }
  };

  const handleChangeStatus = async (val: string) => {
    setOpenConfirmSubmit(true);
    setStatus(val);
  };

  const handleDownloadFile = async (val: any) => {
    router.push(`${process.env.BASE_URL}/notulen/getFile/${val}`)
  }

  return (
    <>
      <div className="flex items-center justify-between mt-8 mb-2">
        <div
          className="border border-xl-base rounded-md w-[10%] px-4 py-1 flex items-center gap-2 bg-white hover:shadow-md hover:cursor-pointer"
          onClick={handlePrint}
        >
          <BsPrinter size={20} />
          <div>Cetak</div>
        </div>
        <div className={`${profile.role == 4 ? data.status === "Disetujui" ? 'hidden' : 'block' : 'hidden'}`}>
          {isOpenEdit ? (
            <div className="border bg-danger text-white hover:bg-xl-pink rounded-lg px-8 py-1 hover:shadow-lg hover:cursor-pointer" onClick={() => setIsOpenEdit(false)}>
              Tutup
            </div>
          ) : (
            <div className="border border-warning rounded-lg px-8 py-1 hover:shadow-lg bg-white hover:cursor-pointer" onClick={() => setIsOpenEdit(true)}>
              Edit
            </div>
          )}
        </div>
      </div>
      <div className={`detail-wrap bg-white dark:bg-meta-4 rounded-lg p-8 ${!isOpenEdit ? 'block' : 'hidden'}`}>
        <div className="flex flex-col gap-4">
          <div className={`body flex flex-row md:flex-row flex-col items-center justify-between ${profile.role == 2 ? 'block' : 'hidden'}`}>
            <div className="text-label md:w-[20%] w-full md:text-left text-center">
              Pilih Tagging
            </div>
            <div className="md:mt-4 mt-2 md:w-[75%]">
              <div className="data flex flex-row mb-8 w-full">
                <div className="data flex flex-row bg-white w-full">
                  <Select
                    isMulti
                    name="tagging"
                    options={listTagging}
                    className="basic-multi-select w-full bg-white"
                    classNamePrefix="select"
                    defaultValue={data.tagging}
                    onChange={(selectedOption: any) => {
                      handleChange({
                        target: { name: "tagging", value: selectedOption },
                      });
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="body flex flex-row md:flex-row flex-col items-center justify-between">
            <div className="text-label md:w-[20%] w-full md:text-left text-center">
              Pembuat Notulen
            </div>
            <div className="md:mt-0 mt-2 md:w-[75%] w-full">
              <div className="flex border-2 border-light-gray rounded-lg w-full py-3 px-4">
                {data.Pegawai?.nama}
              </div>
            </div>
          </div>
          <div className="body flex md:flex-row flex-col items-center justify-between">
            <div className="text-label md:w-[20%] w-full md:text-left text-center">
              Hari / Tanggal
            </div>
            <div className="md:mt-0 mt-2 md:w-[75%] w-full">
              <div className="flex border-2 border-light-gray rounded-lg w-full py-3 px-4">
                <div className="flex gap-4">
                  {data.tanggal[0]?.startDate !== null && (
                    <span>{formatDate(data.tanggal[0]?.startDate)}</span>
                  )}
                  {data.tanggal[0]?.endDate !== null &&
                    data.tanggal[0]?.endDate !== data.tanggal[0]?.startDate && (
                      <>
                        <span>-</span>
                        <span>{formatDate(data.tanggal[0]?.endDate)}</span>
                      </>
                    )}
                </div>
              </div>
            </div>
          </div>
          <div className="body flex flex-row md:flex-row flex-col items-center justify-between">
            <div className="text-label md:w-[20%] w-full md:text-left text-center">
              Waktu
            </div>
            <div className="md:mt-0 mt-2 md:w-[75%] w-full">
              <div className="flex border-2 border-light-gray rounded-lg w-full py-3 px-4">
                {getTime(data.waktu)}
              </div>
            </div>
          </div>
          <div className="body flex flex-row md:flex-row flex-col items-center justify-between">
            <div className="text-label md:w-[20%] w-full md:text-left text-center">
              Acara
            </div>
            <div className="md:mt-0 mt-2 md:w-[75%] w-full">
              <div className="flex border-2 border-light-gray rounded-lg w-full py-3 px-4">
                {data.acara}
              </div>
            </div>
          </div>
          <div className="body flex flex-row md:flex-row flex-col items-center justify-between">
            <div className="text-label md:w-[20%] w-full md:text-left text-center">
              Tempat / Lokasi
            </div>
            <div className="md:mt-0 mt-2 md:w-[75%] w-full">
              <div className="flex border-2 border-light-gray rounded-lg w-full py-3 px-4">
                {data.lokasi}
              </div>
            </div>
          </div>
          <div className="body flex flex-row md:flex-row flex-col items-center justify-between">
            <div className="text-label md:w-[20%] w-full md:text-left text-center">
              Pendahuluan
            </div>
            <div className="md:mt-0 mt-2 md:w-[75%] w-full">
              <div className="flex border-2 border-light-gray rounded-lg w-full py-3 px-4">
                {data.pendahuluan}
              </div>
            </div>
          </div>
          <div className="body flex flex-row md:flex-row flex-col items-center justify-between">
            <div className="text-label md:w-[20%] w-full md:text-left text-center">
              Pimpinan Rapat
            </div>
            <div className="md:mt-0 mt-2 md:w-[75%] w-full">
              <div className="flex border-2 border-light-gray rounded-lg w-full py-3 px-4">
                {data.pimpinan_rapat}
              </div>
            </div>
          </div>
          <div className="body flex flex-row md:flex-row flex-col items-center justify-between">
            <div className="text-label md:w-[20%] w-full md:text-left text-center">
              Peserta Rapat
            </div>
            <div className="md:mt-0 mt-2 md:w-[75%] w-full">
              <div className="flex border-2 border-light-gray rounded-lg w-full py-3 px-4">
                <ul className="flex flex-col gap-2">
                  {data.peserta_rapat.map((el: any, i: number) => (
                    <li className="flex gap-3">
                      <div>{i + 1}.</div>
                      <div>{el.nama}</div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
          <div className="body flex flex-row md:flex-row flex-col items-center justify-between">
            <div className="text-label md:w-[20%] w-full md:text-left text-center">
              Isi Rapat
            </div>
            <div className="md:mt-0 mt-2 md:w-[75%] w-full">
              <div className="flex border-2 border-light-gray rounded-lg w-full py-3 px-4">
                <div dangerouslySetInnerHTML={{ __html: htmlIsiRapat }}></div>
              </div>
            </div>
          </div>
          <div className="body flex flex-row md:flex-row flex-col items-center justify-between">
            <div className="text-label md:w-[20%] w-full md:text-left text-center">
              Tindak Lanjut
            </div>
            <div className="md:mt-0 mt-2 md:w-[75%] w-full">
              <div className="flex border-2 border-light-gray rounded-lg w-full py-3 px-4">
                <div
                  dangerouslySetInnerHTML={{ __html: htmlTindakLanjut }}
                ></div>
              </div>
            </div>
          </div>
          <div className="body flex flex-row md:flex-row flex-col items-center justify-between">
            <div className="text-label md:w-[20%] w-full md:text-left text-center">
              Pelapor
            </div>
            <div className="md:mt-0 mt-2 md:w-[75%] w-full">
              <div className="flex border-2 border-light-gray rounded-lg w-full py-3 px-4">
                <div className="flex flex-col w-full">
                  <div className="flex gap-3">
                    <div className="w-[15%]">Nama</div>
                    <div className="w-[5%]">:</div>
                    <div className="w-[80%]">{data.pelapor.nama}</div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-[15%]">NIP</div>
                    <div className="w-[5%]">:</div>
                    <div className="w-[80%]">{data.pelapor.nip}</div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-[15%]">Pangkat</div>
                    <div className="w-[5%]">:</div>
                    <div className="w-[80%]">{data.pelapor.pangkat}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="body flex flex-row md:flex-row flex-col items-center justify-between">
            <div className="text-label md:w-[20%] w-full md:text-left text-center">
              Atasan
            </div>
            <div className="md:mt-0 mt-2 md:w-[75%] w-full">
              <div className="flex border-2 border-light-gray rounded-lg w-full py-3 px-4">
                <div className="flex flex-col w-full">
                  <div className="flex gap-3">
                    <div className="w-[15%]">Nama</div>
                    <div className="w-[5%]">:</div>
                    <div className="w-[80%]">{data.atasan.nama}</div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-[15%]">NIP</div>
                    <div className="w-[5%]">:</div>
                    <div className="w-[80%]">{data.atasan.nip}</div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-[15%]">Pangkat</div>
                    <div className="w-[5%]">:</div>
                    <div className="w-[80%]">{data.atasan.pangkat}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="body flex flex-row md:flex-row flex-col items-center justify-between">
            <div className="w-[15%]">Surat Undangan</div>
            <div className="md:mt-0 mt-2 md:w-[75%] w-full">
              <div className="flex border-2 border-light-gray rounded-lg w-full py-3 px-4 hover:cursor-pointer">
                {data.link_img_surat_undangan !== null ? (
                  <button onClick={() => handleDownloadFile(data.link_img_surat_undangan)}>
                    {data.link_img_surat_undangan}
                  </button>
                ) : (
                  <div>-</div>
                )}
              </div>
            </div>
          </div>
          <div className="body flex flex-row md:flex-row flex-col items-center justify-between">
            <div className="w-[15%]">Daftar Hadir</div>
            <div className="md:mt-0 mt-2 md:w-[75%] w-full">
              <div className="flex border-2 border-light-gray rounded-lg w-full py-3 px-4">
                {data.link_img_daftar_hadir !== null ? (
                  <Link
                    href={`localhost:8080/notulen/getFile/${data.link_img_daftar_hadir}`}
                    passHref
                    legacyBehavior
                  >
                    <a target="_blank">
                      <td className="text-blue-500 underline">
                        {data.link_img_daftar_hadir}
                      </td>
                    </a>
                  </Link>
                ) : (
                  <div>-</div>
                )}
              </div>
            </div>
          </div>
          <div className="body flex flex-row md:flex-row flex-col items-center justify-between">
            <div className="w-[15%]">SPJ</div>
            <div className="md:mt-0 mt-2 md:w-[75%] w-full">
              <div className="flex border-2 border-light-gray rounded-lg w-full py-3 px-4">
                {data.link_img_spj !== null ? (
                  <div onClick={() => downloadFile(data.link_img_spj)}>
                    <div className="text-blue-500 underline">
                      {data.link_img_spj}
                    </div>
                  </div>
                ) : (
                  <div>-</div>
                )}
              </div>
            </div>
          </div>
          <div className="body flex flex-row md:flex-row flex-col items-center justify-between">
            <div className="w-[15%]">Foto</div>
            <div className="md:mt-0 mt-2 md:w-[75%] w-full">
              <div className="flex border-2 border-light-gray rounded-lg w-full py-3 px-4">
                {data.link_img_foto !== null ? (
                  <Link
                    href={`localhost:8080/notulen/getFile/${data.link_img_foto}`}
                    passHref
                    legacyBehavior
                  >
                    <a target="_blank">
                      <td className="text-blue-500 underline">
                        {data.link_img_foto}
                      </td>
                    </a>
                  </Link>
                ) : (
                  <div>-</div>
                )}
              </div>
            </div>
          </div>
          <div className="body flex flex-row md:flex-row flex-col items-center justify-between">
            <div className="w-[15%]">Pendukung</div>
            <div className="md:mt-0 mt-2 md:w-[75%] w-full">
              <div className="flex border-2 border-light-gray rounded-lg w-full py-3 px-4">
                {data.link_pendukung !== null ? (
                  <div onClick={() => downloadFile(data.link_img_pendukung)}>
                    <div className="text-blue-500 underline">
                      {data.link_img_pendukung}
                    </div>
                  </div>
                ) : (
                  <div>-</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* <div className={`${data.status === '-' ? 'block' : 'hidden'}`}>
        <div className={`${profile.role == 2 ? "block" : "hidden"}`}>
          <div>
            <Button
              variant="error"
              className="button-container mb-2 mt-5"
              rounded
              onClick={() => handleChangeStatus("Ditolak")}
            >
              <div className="flex justify-center items-center text-white px-10">
                <span className="button-text">Batal</span>
              </div>
            </Button>
          </div>
        </div>
        <div className={`w-[8em]`}>
          {profile.role == 2 ? (
            <div className={`${tagging.length != 0 ? "block" : "hidden"}`}>
              <Button
                variant="xl"
                className="button-container mb-2 mt-5"
                rounded
                onClick={handleSubmit}
              >
                <div className="flex justify-center items-center text-white">
                  <span className="button-text">Tambah</span>
                </div>
              </Button>
            </div>
          ) : (
            profile.role == 3 && (
              <div>
                <Button
                  variant="xl"
                  className="button-container mb-2 mt-5"
                  rounded
                  onClick={() => handleChangeStatus("Disetujui")}
                >
                  <div className="flex justify-center items-center text-white">
                    <span className="button-text">Setujui</span>
                  </div>
                </Button>
              </div>
            )
          )}
        </div>
      </div> */}
      <div className={`${data.status === '-' ? 'block' : 'hidden'} flex justify-between`}>
        <div className={`${profile.role == 3 ? "block" : "hidden"}`}>
          <div>
            <Button
              variant="error"
              className="button-container mb-2 mt-5"
              rounded
              onClick={() => handleChangeStatus("Ditolak")}
            >
              <div className="flex justify-center items-center text-white px-10">
                <span className="button-text">Tolak</span>
              </div>
            </Button>
          </div>
        </div>
        <div className={`w-[8em]`}>
          {profile.role == 2 ? (
            <div className={`${tagging.length != 0 ? "block" : "hidden"}`}>
              <Button
                variant="xl"
                className="button-container mb-2 mt-5"
                rounded
                onClick={handleSubmit}
              >
                <div className="flex justify-center items-center text-white">
                  <span className="button-text">Tambah</span>
                </div>
              </Button>
            </div>
          ) : (
            profile.role == 3 && (
              <div>
                <Button
                  variant="xl"
                  className="button-container mb-2 mt-5"
                  rounded
                  onClick={() => handleChangeStatus("Disetujui")}
                >
                  <div className="flex justify-center items-center text-white">
                    <span className="button-text">Setujui</span>
                  </div>
                </Button>
              </div>
            )
          )}
        </div>
      </div>
      <div className={`${isOpenEdit ? 'block' : 'hidden'}`}>
        <EditNotulenForm dataNotulen={data} />
      </div>

      <XConfirmStatus
        openConfirmSubmit={openConfirmSubmit}
        setOpenConfirmSubmit={setOpenConfirmSubmit}
        status={status}
        data={data}
      />
    </>
  );
};

export default NotulenDetailProps;
