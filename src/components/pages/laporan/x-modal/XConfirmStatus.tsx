import * as React from 'react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector, shallowEqual } from 'react-redux';
import { CommonModal } from '@/components/common/common-modal/modal';
import TextInput from '@/components/common/text-input/input';
import { Button } from '@/components/common/button/button';
import { fetchApi } from '@/components/mixins/request';
import Swal from 'sweetalert2';
import { State } from '@/store/reducer';

interface PropTypes {
  openConfirmSubmit: boolean,
  setOpenConfirmSubmit: any,
  status: string,
  data: any,
  // setLoading: any
}

const XConfirmStatus = ({
  openConfirmSubmit,
  setOpenConfirmSubmit,
  status,
  data,
  // setLoading
}: PropTypes) => {
  const router = useRouter();
  const [reason, setReason] = useState<string>('');
  const [agree, setAgree] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const { profile } = useSelector((state: State) => ({
    profile: state.profile.profile
  }), shallowEqual);

  const handleChangeAgree = (e: any) => {
    setAgree(e.target.checked)
  }

  const onClose = () => {
    setOpenConfirmSubmit(false);
    setAgree(false);
  }

  const handleChange = (e: any) => setReason(e.target.value);

  const handleSubmit = async () => {
    setLoading(true);
    const payload = {
      status: status,
      keterangan: reason
    };

    const response = await fetchApi({
      url: `/notulen/updateStatus/${data.id}`,
      method: "put",
      body: payload,
      type: "auth",
    });

    if (!response.success) {
      setLoading(false);
      if (response.data.code == 500) {
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "Koneksi bermasalah!",
        });
      }
    } else {
      setLoading(false);
      Swal.fire({
        position: "center",
        icon: "success",
        title: `Status ${status}`,
        showConfirmButton: false,
        timer: 1500,
      });
      router.push("/notulen/laporan");
    }
  }

  return (
    <CommonModal isOpen={openConfirmSubmit} onClose={setOpenConfirmSubmit}>
      <div className="relative items-center justify-center pt-3">
        {status === "Ditolak" ? (
          <div className='w-[100%]'>
            <div className="font-Nunito-Bold md:text-xl text-md text-center">Mengapa Anda Menolak Notulen ?</div>
            <div className="mt-6 w-[100%]">
              <TextInput
                type="text-area"
                id="reason"
                name="reason"
                label="Masukkan Alasan"
                value={reason}
                change={handleChange}
              />
            </div>
            <div className="btn mt-4 flex items-center justify-between">
              <div className="btn-cancel">
                <Button
                  variant="error"
                  type="secondary"
                  className="button-container mb-2 mt-5"
                  rounded
                  onClick={onClose}
                  loading={loading}
                >
                  <div className="flex px-6 text-[#002DBB] font-Nunito">
                    <span className="button-text text-danger">Batal</span>
                  </div>
                </Button>
              </div>
              <div className="btn-cancell">
                <Button
                  variant="error"
                  className="button-container mb-2 mt-5"
                  rounded
                  disabled={reason === ''}
                  onClick={handleSubmit}
                  loading={loading}
                >
                  <div className="flex px-6 text-white font-Nunito">
                    <span className="button-text">Menolak</span>
                  </div>
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className='w-full'>
            <div className="flex items-center justify-center">
              <img src='/illustrator/ok.svg' className="md:w-[160px] w-[100px] my-6" alt="Ok" />
            </div>
            <div className="font-Nunito-Bold md:text-xl text-md text-center">Yakin Menyetujui data ?</div>
            <div className="mt-6 w-full">
              <TextInput
                type="text-area"
                id="reason"
                name="reason"
                label="Masukkan Alasan"
                value={reason}
                change={(e: any) => setReason(e.target.value)}
              />
            </div>
            <div className="flex flex-row py-6 px-8 flex justify-center items-center">
              <div>
                <TextInput
                  type="checkbox"
                  name="consent"
                  id="consent"
                  placeholder="Masukkan consent"
                  change={handleChangeAgree}
                />
              </div>
              <div>
                <p className="ml-2 mt-[9px] mt-md-1 text-[#68788A] text-Nunito text-xs">
                  Saya menyetujui bahwa data data ini adalah benar dan dapat dipertanggungjawabkan
                </p>
              </div>
            </div>
            <div className="btn mt-4 flex items-center justify-between">
              <div className="btn-cancel">
                <Button
                  variant="xl"
                  type="secondary"
                  className="button-container mb-2 mt-5"
                  rounded
                  onClick={onClose}
                  loading={loading}
                >
                  <div className="flex px-6 text-[#002DBB] font-Nunito">
                    <span className="button-text">Batal</span>
                  </div>
                </Button>
              </div>
              <div className="btn-cancell">
                <Button
                  variant="xl"
                  className="button-container mb-2 mt-5"
                  rounded
                  disabled={!agree}
                  onClick={handleSubmit}
                  loading={loading}
                >
                  <div className="flex px-6 text-white font-Nunito">
                    <span className="button-text">Menyetujui</span>
                  </div>
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </CommonModal >
  )
}

export default XConfirmStatus;